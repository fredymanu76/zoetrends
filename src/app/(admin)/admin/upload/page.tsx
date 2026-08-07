"use client";

// Chat-style AI studio (modelled on the FASHN Agent interface Zoe likes):
// drop a garment photo, describe the model/look you want in plain English,
// the shot generates in the thread, then publish it to the shop inline.

import { useEffect, useRef, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { CATEGORIES } from "@/lib/constants";
import { FiArrowUp, FiDownload, FiImage, FiPlus, FiX } from "react-icons/fi";

type Shot = { url: string; view: "front" | "side" | "back" };

type Msg =
  | { kind: "user"; text: string; images: string[] }
  | { kind: "assistant"; text: string; tone?: "normal" | "error" }
  | {
      kind: "generation";
      id: string;
      description: string;
      flatUrl: string;
      shots: Shot[];
      status: "loading" | "done" | "error";
      error?: string;
      busy?: string;
      published?: { slug: string; name: string };
      publishing?: boolean;
    };

type Chat = { id: string; title: string; createdAt: number; messages: Msg[] };

const STORE_KEY = "studio_chats_v1";

function loadChats(): Chat[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Chat[]) : [];
    // Drop in-flight state that can't survive a reload.
    return parsed.map((c) => ({
      ...c,
      messages: c.messages.filter(
        (m) => m.kind !== "generation" || m.status === "done" || m.status === "error"
      ),
    }));
  } catch {
    return [];
  }
}

export default function StudioPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState<{ file: File; preview: string }[]>([]);
  const [sending, setSending] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loaded = loadChats();
    setChats(loaded);
    if (loaded.length) setActiveId(loaded[0].id);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(chats.slice(0, 30)));
    } catch {
      /* storage full — chat history is a convenience only */
    }
  }, [chats]);

  const activeMsgCount = chats.find((c) => c.id === activeId)?.messages.length ?? 0;
  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [activeMsgCount, activeId]);

  const active = chats.find((c) => c.id === activeId) || null;

  function updateChat(id: string, fn: (c: Chat) => Chat) {
    setChats((prev) => prev.map((c) => (c.id === id ? fn(c) : c)));
  }
  function updateGen(chatId: string, genId: string, patch: Partial<Extract<Msg, { kind: "generation" }>>) {
    updateChat(chatId, (c) => ({
      ...c,
      messages: c.messages.map((m) =>
        m.kind === "generation" && m.id === genId ? { ...m, ...patch } : m
      ),
    }));
  }

  function newChat(): Chat {
    const chat: Chat = { id: `${Date.now()}`, title: "New chat", createdAt: Date.now(), messages: [] };
    setChats((prev) => [chat, ...prev]);
    setActiveId(chat.id);
    return chat;
  }

  function addFiles(files: FileList | null) {
    if (!files) return;
    const next = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({ file: f, preview: URL.createObjectURL(f) }));
    setAttachments((prev) => [...prev, ...next]);
  }

  async function callGenerate(fd: FormData): Promise<{ ok: boolean; flatUrl?: string; shotUrl?: string; view?: string; error?: string }> {
    const token = sessionStorage.getItem("admin_token") || "";
    try {
      const res = await fetch("/api/admin/agent-generate", {
        method: "POST",
        headers: { "x-admin-password": token },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error || "Generation failed." };
      return { ok: true, ...data };
    } catch {
      return { ok: false, error: "Network error — please try again." };
    }
  }

  async function send() {
    const text = draft.trim();
    if (!text || sending) return;
    const chat = active || newChat();
    const chatId = chat.id;

    // A message with photos starts a generation per photo; a message without
    // photos restyles the most recent garment with the new description.
    const lastGen = [...chat.messages].reverse().find(
      (m): m is Extract<Msg, { kind: "generation" }> => m.kind === "generation" && m.status === "done"
    );
    if (!attachments.length && !lastGen) {
      updateChat(chatId, (c) => ({
        ...c,
        messages: [
          ...c.messages,
          { kind: "user", text, images: [] },
          { kind: "assistant", text: "Add a photo of the garment first — then tell me how you'd like it modelled.", tone: "error" },
        ],
      }));
      setDraft("");
      return;
    }

    setSending(true);
    const atts = attachments;
    setAttachments([]);
    setDraft("");

    updateChat(chatId, (c) => ({
      ...c,
      title: c.title === "New chat" ? text.slice(0, 48) : c.title,
      messages: [
        ...c.messages,
        { kind: "user", text, images: atts.map((a) => a.preview) },
        { kind: "assistant", text: "I'll show this on a model matching your description." },
      ],
    }));

    const jobs = atts.length
      ? atts.map((a) => ({ file: a.file as File | null, flatUrl: "" }))
      : [{ file: null as File | null, flatUrl: lastGen!.flatUrl }];

    for (const job of jobs) {
      const genId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      updateChat(chatId, (c) => ({
        ...c,
        messages: [
          ...c.messages,
          { kind: "generation", id: genId, description: text, flatUrl: job.flatUrl, shots: [], status: "loading" },
        ],
      }));
      const fd = new FormData();
      fd.append("description", text);
      fd.append("view", "front");
      fd.append("seed", String(Math.floor(Math.random() * 100000)));
      if (job.file) fd.append("file", job.file);
      else fd.append("flatUrl", job.flatUrl);
      const result = await callGenerate(fd);
      if (result.ok && result.shotUrl) {
        updateGen(chatId, genId, {
          status: "done",
          flatUrl: result.flatUrl || job.flatUrl,
          shots: [{ url: result.shotUrl, view: "front" }],
        });
      } else {
        updateGen(chatId, genId, { status: "error", error: result.error });
      }
    }

    updateChat(chatId, (c) => ({
      ...c,
      messages: [
        ...c.messages,
        {
          kind: "assistant",
          text: "What would you like to do next? You can add more angles, describe a different look, or publish it to the shop.",
        },
      ],
    }));
    setSending(false);
  }

  async function addAngle(gen: Extract<Msg, { kind: "generation" }>, view: "side" | "back") {
    if (!active || gen.busy) return;
    const chatId = active.id;
    updateGen(chatId, gen.id, { busy: view });
    const fd = new FormData();
    fd.append("description", gen.description);
    fd.append("view", view);
    fd.append("flatUrl", gen.flatUrl);
    const result = await callGenerate(fd);
    if (result.ok && result.shotUrl) {
      updateGen(chatId, gen.id, { busy: undefined, shots: [...gen.shots, { url: result.shotUrl, view }] });
    } else {
      updateGen(chatId, gen.id, { busy: undefined });
      updateChat(chatId, (c) => ({
        ...c,
        messages: [...c.messages, { kind: "assistant", text: result.error || "That angle failed — try again.", tone: "error" }],
      }));
    }
  }

  async function publish(gen: Extract<Msg, { kind: "generation" }>, name: string, price: string, category: string) {
    if (!active) return;
    const chatId = active.id;
    updateGen(chatId, gen.id, { publishing: true });
    const token = sessionStorage.getItem("admin_token") || "";
    try {
      const res = await fetch("/api/admin/agent-publish", {
        method: "POST",
        headers: { "x-admin-password": token, "Content-Type": "application/json" },
        body: JSON.stringify({ name, price: Number(price), category, flatUrl: gen.flatUrl, shots: gen.shots }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Publish failed");
      updateGen(chatId, gen.id, { publishing: false, published: { slug: data.slug, name } });
    } catch (err) {
      updateGen(chatId, gen.id, { publishing: false });
      updateChat(chatId, (c) => ({
        ...c,
        messages: [
          ...c.messages,
          { kind: "assistant", text: err instanceof Error ? err.message : "Publish failed.", tone: "error" },
        ],
      }));
    }
  }

  const mediaUrls = (active?.messages || []).flatMap((m) =>
    m.kind === "generation" ? [m.flatUrl, ...m.shots.map((s) => s.url)].filter(Boolean) : []
  );

  return (
    <AdminShell>
      <div className="flex h-[calc(100vh-7rem)] -m-2 sm:m-0 bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Chats sidebar */}
        <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-gray-100">
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="font-serif text-lg text-charcoal">Chats</h2>
            <button
              onClick={() => newChat()}
              className="p-1.5 rounded-md hover:bg-gray-100 text-charcoal/60"
              title="New chat"
            >
              <FiPlus />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-2 space-y-1">
            {chats.map((c) => {
              const thumb = c.messages.find((m) => m.kind === "generation") as
                | Extract<Msg, { kind: "generation" }>
                | undefined;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`w-full flex gap-2 items-center rounded-lg p-2 text-left ${
                    c.id === activeId ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
                >
                  {thumb?.shots[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb.shots[0].url} alt="" className="w-9 h-11 object-cover rounded" />
                  ) : (
                    <div className="w-9 h-11 rounded bg-gray-100 flex items-center justify-center text-charcoal/30">
                      <FiImage />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs text-charcoal truncate">{c.title}</p>
                    <p className="text-[10px] text-charcoal/40">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              );
            })}
            {!chats.length && (
              <p className="text-xs text-charcoal/40 px-2 pt-2">
                Your styling chats will appear here.
              </p>
            )}
          </div>
        </aside>

        {/* Thread */}
        <section className="flex-1 flex flex-col min-w-0">
          <div ref={threadRef} className="flex-1 overflow-y-auto px-4 sm:px-10 py-6 space-y-5">
            {!active?.messages.length && (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <h1 className="font-serif text-3xl text-charcoal mb-2">What will you create today?</h1>
                <p className="text-sm text-charcoal/50 max-w-md">
                  Add a photo of a garment and describe the model you want — for example{" "}
                  <em>&ldquo;I would like this top to fit a mixed race, medium built, 5&rsquo;6&rdquo; female&rdquo;</em>.
                </p>
              </div>
            )}
            {active?.messages.map((m, i) => {
              if (m.kind === "user") {
                return (
                  <div key={i} className="flex flex-col items-end gap-2">
                    {m.images.length > 0 && (
                      <div className="flex gap-2">
                        {m.images.map((src, k) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={k} src={src} alt="" className="w-16 h-20 object-cover rounded-lg border border-gray-200" />
                        ))}
                      </div>
                    )}
                    <div className="max-w-[80%] bg-gray-100 rounded-2xl rounded-br-md px-4 py-2 text-sm text-charcoal">
                      {m.text}
                    </div>
                  </div>
                );
              }
              if (m.kind === "assistant") {
                return (
                  <div key={i} className="flex">
                    <div
                      className={`max-w-[80%] rounded-2xl rounded-bl-md px-4 py-2 text-sm ${
                        m.tone === "error" ? "bg-red-50 text-red-700" : "bg-gray-50 text-charcoal/80"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                );
              }
              // generation card
              return (
                <div key={m.id} className="space-y-2">
                  <p className="text-xs text-charcoal/50">Generate Image</p>
                  {m.status === "loading" && (
                    <div className="w-64 h-80 rounded-xl bg-gray-100 animate-pulse flex items-center justify-center text-xs text-charcoal/40">
                      Modelling… ~25s
                    </div>
                  )}
                  {m.status === "error" && (
                    <div className="max-w-[80%] rounded-2xl px-4 py-2 text-sm bg-red-50 text-red-700">
                      {m.error}
                    </div>
                  )}
                  {m.status === "done" && (
                    <>
                      <div className="flex gap-3 flex-wrap">
                        {m.shots.map((s) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={s.url} src={s.url} alt={s.view} className="w-64 rounded-xl border border-gray-100" />
                        ))}
                        {m.busy && (
                          <div className="w-64 h-80 rounded-xl bg-gray-100 animate-pulse flex items-center justify-center text-xs text-charcoal/40">
                            Adding {m.busy === "side" ? "¾ view" : "back view"}…
                          </div>
                        )}
                      </div>
                      {m.published ? (
                        <div className="text-sm bg-green-50 text-green-800 rounded-xl px-4 py-2 inline-block">
                          Published <strong>{m.published.name}</strong> —{" "}
                          <a className="underline" href={`/products/${m.published.slug}`} target="_blank">
                            view in shop
                          </a>
                        </div>
                      ) : (
                        <GenActions gen={m} onAngle={addAngle} onPublish={publish} />
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Composer */}
          <div className="px-4 sm:px-10 pb-4">
            {attachments.length > 0 && (
              <div className="flex gap-2 mb-2">
                {attachments.map((a, i) => (
                  <div key={i} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.preview} alt="" className="w-14 h-16 object-cover rounded-lg border border-gray-200" />
                    <button
                      onClick={() => setAttachments((prev) => prev.filter((_, k) => k !== i))}
                      className="absolute -top-1.5 -right-1.5 bg-charcoal text-white rounded-full p-0.5"
                    >
                      <FiX size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="border border-gray-200 rounded-2xl shadow-sm px-3 py-2">
              <textarea
                rows={1}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Describe what you want… e.g. fit this dress on a tall Black female model"
                className="w-full resize-none outline-none text-sm text-charcoal placeholder:text-charcoal/40 px-1 pt-1"
              />
              <div className="flex items-center justify-between mt-1">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1.5 text-sm text-charcoal/70 border border-gray-200 rounded-full px-3 py-1.5 hover:bg-gray-50"
                >
                  <FiImage size={14} /> Add images
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    addFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
                <button
                  onClick={send}
                  disabled={sending || !draft.trim()}
                  className="p-2 rounded-full bg-charcoal text-white disabled:opacity-30"
                  title="Send"
                >
                  <FiArrowUp size={14} />
                </button>
              </div>
            </div>
            <p className="text-[10px] text-charcoal/35 mt-1.5 text-center">
              Each shot uses ~2 FASHN credits. Photos with several garments? Crop to one garment per photo for best results.
            </p>
          </div>
        </section>

        {/* Media rail */}
        {mediaUrls.length > 0 && (
          <aside className="hidden lg:block w-24 shrink-0 border-l border-gray-100 p-2 overflow-y-auto">
            <p className="text-[10px] tracking-widest text-charcoal/40 mb-2 px-1">MEDIA</p>
            <div className="space-y-2">
              {mediaUrls.map((u, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={`${u}-${i}`} src={u} alt="" className="w-full rounded-lg border border-gray-100" />
              ))}
            </div>
          </aside>
        )}
      </div>
    </AdminShell>
  );
}

function GenActions({
  gen,
  onAngle,
  onPublish,
}: {
  gen: Extract<Msg, { kind: "generation" }>;
  onAngle: (g: Extract<Msg, { kind: "generation" }>, v: "side" | "back") => void;
  onPublish: (g: Extract<Msg, { kind: "generation" }>, name: string, price: string, category: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const hasSide = gen.shots.some((s) => s.view === "side");
  const hasBack = gen.shots.some((s) => s.view === "back");

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <a
          href={gen.shots[0]?.url}
          download
          target="_blank"
          className="flex items-center gap-1.5 text-xs border border-gray-200 rounded-full px-3 py-1.5 hover:bg-gray-50 text-charcoal/80"
        >
          <FiDownload size={12} /> Download
        </a>
        {!hasSide && (
          <button
            onClick={() => onAngle(gen, "side")}
            disabled={!!gen.busy}
            className="text-xs border border-gray-200 rounded-full px-3 py-1.5 hover:bg-gray-50 text-charcoal/80 disabled:opacity-40"
          >
            + ¾ view
          </button>
        )}
        {!hasBack && (
          <button
            onClick={() => onAngle(gen, "back")}
            disabled={!!gen.busy}
            className="text-xs border border-gray-200 rounded-full px-3 py-1.5 hover:bg-gray-50 text-charcoal/80 disabled:opacity-40"
          >
            + back view
          </button>
        )}
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-xs rounded-full px-3 py-1.5 bg-gold text-white hover:opacity-90"
        >
          Publish to shop
        </button>
      </div>
      {open && (
        <div className="border border-gray-200 rounded-xl p-3 max-w-md space-y-2 bg-gray-50/50">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Product name *"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          />
          <div className="flex gap-2">
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price £ *"
              inputMode="decimal"
              className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-2 py-2 text-sm bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => onPublish(gen, name, price, category)}
            disabled={gen.publishing || !name.trim() || !(Number(price) > 0)}
            className="w-full rounded-lg bg-charcoal text-white text-sm py-2 disabled:opacity-40"
          >
            {gen.publishing ? "Publishing…" : "Publish"}
          </button>
        </div>
      )}
    </div>
  );
}
