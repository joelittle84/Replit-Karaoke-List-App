import { useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Instagram, Loader2,
  Mail, Music2, Play, Star, Users,
} from "lucide-react";
import { TbGuitarPick } from "react-icons/tb";
import { NeonButton } from "@/components/NeonButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface BookingPage {
  enabled: boolean;
  title: string;
  bio: string;
  photos: string[];
  videos: { url: string; title: string }[];
  genres: string;
  performanceInfo: string;
  email: string;
}

interface ExperienceOption {
  title: string;
  tagline: string;
  summary: string;
  paragraphs: string[];
}

type IconProps = { className?: string };

function BookingAssetIcon({ src, className }: IconProps & { src: string }) {
  return <span aria-hidden="true" className={`inline-block bg-current ${className ?? ""}`} style={{ WebkitMask: `url(${src}) center / contain no-repeat`, mask: `url(${src}) center / contain no-repeat` }} />;
}

function PalmTreeIcon({ className }: IconProps) {
  return <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><path d="M16 28c.7-6.7.3-12.2-1.3-16.4" /><path d="M14.7 11.6C10.1 8.3 6.2 9 3.5 12c4.6-.3 7.7.9 10.2 3.2" /><path d="M15 11.8C10.8 6.9 7 6.2 3.3 7.8c4.5 1.1 7.2 3.1 9.4 6" /><path d="M15.3 11.7C14.4 6.2 16.4 3 20 2c-1.9 4.1-2 7.3-1 10.4" /><path d="M16.2 11.8c4.1-4.5 8.1-4.4 11.6-2.3-4.7.4-7.7 2.1-10 4.9" /><path d="M18 13.6c4.4-1.8 7.7-.4 9.8 2.6-4.1-1.1-7.3-.6-10.3 1.1" /><path d="M10 28h12" /></svg>;
}

function HandheldMicrophoneIcon({ className }: IconProps) {
  return <img src="/booking-icons/inquiry-microphone-approved.png" alt="" aria-hidden="true" className={`object-contain ${className ?? ""}`} />;
}

function DrumKitIcon({ className }: IconProps) {
  return <BookingAssetIcon src="/booking-icons/full-band-drum-kit.svg" className={className} />;
}

function ElectricGuitarIcon({ className }: IconProps) {
  return <BookingAssetIcon src="/booking-icons/duo-electric-guitar.svg" className={className} />;
}

function ElectricGuitarAltIcon({ className }: IconProps) {
  return <BookingAssetIcon src="/booking-icons/guitar-i-oke-electric-guitar.svg" className={className} />;
}

function JukeboxIcon({ className }: IconProps) {
  return <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><path d="M7 29V12a9 9 0 0 1 18 0v17H7Z" /><path d="M10 28V12a6 6 0 0 1 12 0v16M10 17h12M11.5 20.5h9v5h-9z" /><path d="M13 14v-3.5a3 3 0 0 1 6 0V14h-6ZM7 22h3m12 0h3M14 23h4" /><circle cx="16" cy="10.5" r="1.4" /><path d="M9.5 29v-2m13 2v-2" /></svg>;
}

const experiences: ExperienceOption[] = [
  {
    title: "Full Band Experience",
    tagline: "Big Sound = Big Fun",
    summary: "Sing with a full band!",
    paragraphs: [
      "Sing with the full Guilty Pleasures band for the complete live-band karaoke experience. We bring a professional rhythm section, professional vocalist and host, pro sound, stage lighting, lyric prompter, and everything needed to turn your guests into the stars of the show.",
      "Our host and band provide backing vocals and harmonies for participants, so whether you're a seasoned singer or a little shy, we've got you covered. The host also keeps the night moving, provides guidance onstage, and adapts to each singer — from doubling vocals for a bigger sound to jumping on a harmony that takes the performance to the next level.",
      "Guests use their mobile devices to browse our constantly evolving catalog, sign up to sing, and then step onstage with a real live band behind them.",
      "Great for: private parties, corporate events, festivals, weddings, and anywhere you want the full concert experience.",
    ],
  },
  {
    title: "DUO",
    tagline: "Live Guitarist & Pro Vocalist / Host",
    summary: "Perfect for a scaled down experience.",
    paragraphs: [
      "A scaled-down setup that still delivers the energy and interaction of Guilty Pleasures live band karaoke. A professional guitarist and professional vocalist/host perform alongside professionally curated custom backing tracks, creating a full and polished sound without the footprint of a complete band.",
      "Includes pro musicians, host, pro sound, stage lighting, lyric prompter, and guest karaoke signups.",
      "Great for: smaller venues, cocktail-style events, private parties, tighter spaces, and events that want live music without a full-band setup.",
    ],
  },
  {
    title: "Jukebox Mode",
    tagline: "A Cover Band, but with a twist",
    summary: "You pick the songs all night long!",
    paragraphs: [
      "Put the Guilty Pleasures band into Jukebox Mode and let your guests curate the setlist live from their devices.",
      "Instead of signing up to sing, the crowd chooses what the band plays next — “All Night Long.” You still get the energy and spontaneity of a live band while keeping the night uniquely interactive, with the guests and audience controlling the soundtrack.",
    ],
  },
  {
    title: "Traditional Cover Band",
    tagline: "Not karaoke? We play it live.",
    summary: "All your favorite hits!",
    paragraphs: [
      "Want the Guilty Pleasures band experience without putting your guests on the microphone? We'll take care of the entertainment, with our professional vocalist handling the lead vocals.",
      "You get the same musicianship, production, energy, sound, and stage setup — just in a more traditional live-band format.",
      "Great for: cocktail hours, receptions, corporate events, festivals, private parties, or any event where you want live music without guest singing.",
    ],
  },
];

const guitarParagraphs = [
  "Want to sit in on second guitar with the band?",
  "We add a second guitar rig, tablet with chord charts, and a separate guest-guitarist signup so musicians in the crowd can sit in and play with Guilty Pleasures.",
  "Singers are usually making the song selections, and part of the fun is the challenge. Grab the guitar, follow the chord chart, and have fun joining the band onstage. Guitar players can expect to sit in for 1–3 songs depending on signups.",
  "No need to worry if you don't know the signature parts — we've got it covered. All skill levels are welcome. Know all the riffs, lyrics, and solos too? Great! We'll be backing you up right alongside the singers.",
  "Guitar-i-Oke™ can be added to the Full Band Experience, DUO, Jukebox Mode, or Traditional Cover Band depending on the event setup.",
];

const storyParagraphs = [
  "Guilty Pleasures was created around a simple idea: bringing musicians and non-musician friends together to play music.",
  "Founded by producer and musician Joe Little, Guilty Pleasures combines professional musicianship, production experience, and a constantly evolving song catalog to create a live music experience built around the people in the room.",
  "With years of production and stage-management experience with Rock and Roll Fantasy Camp, more than 20 years of performing and live-sound experience, and a background that includes Musicians Institute and Columbia College Chicago, these events are a continuation of a lifelong goal: finding creative ways to bring music and memorable experiences together.",
  "The goal is bigger than karaoke. It's about bringing musicians and music lovers together to share the stage — whether that means singing with a full live band, sitting in on guitar, choosing what the band plays next, or simply enjoying a great live show.",
  "From backyard parties and private events to corporate events and major venues, we bring the musicians, production, sound, lighting, technology, and experience needed to turn an ordinary event into something people actually remember.",
];

function getYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const id = parsed.hostname.includes("youtu.be")
      ? parsed.pathname.slice(1)
      : parsed.hostname.includes("youtube.com") ? parsed.searchParams.get("v") || "" : "";
    return id || null;
  } catch {
    return null;
  }
}

function getYouTubeEmbedUrl(url: string): string | null {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : null;
}

export default function Booking() {
  const { toast } = useToast();
  const reduceMotion = useReducedMotion();
  const [submitted, setSubmitted] = useState(false);
  const [expandedExperience, setExpandedExperience] = useState<string | null>(null);
  const [showGuitar, setShowGuitar] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const mediaStripRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", preferredFormat: "", eventType: "", eventDate: "",
    expectedGuestCount: "", performanceLength: "", venue: "", message: "",
  });

  const { data: bookingPhotoDisplay } = useSettings("booking_photo_display");
  const displayMode = bookingPhotoDisplay?.value || "carousel";
  const { data: page, isLoading } = useQuery<BookingPage>({ queryKey: ["/api/booking/page"] });

  const { mutate: submitInquiry, isPending } = useMutation({
    mutationFn: () => apiRequest("POST", "/api/booking/inquiries", {
      name: form.name,
      email: form.email,
      phone: form.phone,
      eventDate: form.eventDate,
      venue: form.venue,
      eventType: form.eventType,
      message: [
        `Preferred Format: ${form.preferredFormat}`,
        form.expectedGuestCount && `Expected Guest Count: ${form.expectedGuestCount}`,
        form.performanceLength && `Performance Length: ${form.performanceLength}`,
        form.message && `Additional Details: ${form.message}`,
      ].filter(Boolean).join("\n"),
    }),
    onSuccess: () => setSubmitted(true),
    onError: (error: any) => toast({ title: "Error", description: error.message || "Failed to send", variant: "destructive" }),
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.preferredFormat || !form.eventType || !form.eventDate || !form.venue.trim()) {
      toast({ title: "Please complete all required fields", variant: "destructive" });
      return;
    }
    submitInquiry();
  };

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!page?.enabled) return <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center"><Music2 className="w-16 h-16 text-primary/50 mb-4" /><h1 className="text-2xl font-display font-bold text-white mb-2">Booking Unavailable</h1><p className="text-muted-foreground mb-6">Booking inquiries are not currently being accepted.</p><Link href="/"><NeonButton variant="outline">Back to Home</NeonButton></Link></div>;

  const icons = [DrumKitIcon, ElectricGuitarIcon, JukeboxIcon, Star];
  const mediaItems = Array.from({ length: Math.max(page.photos.length, page.videos.length) }).flatMap((_, index) => [
    page.photos[index] ? { type: "photo" as const, src: page.photos[index], index } : null,
    page.videos[index] ? { type: "video" as const, video: page.videos[index], index } : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null));
  const moveMedia = (direction: -1 | 1) => mediaStripRef.current?.scrollBy({ left: direction * mediaStripRef.current.clientWidth * 0.82, behavior: reduceMotion ? "auto" : "smooth" });
  const expanded = experiences.find(item => item.title === expandedExperience);
  const heading = (title: string) => <div className="h-5 flex items-center gap-3"><div className="h-px flex-1 bg-gradient-to-r from-transparent via-green-400/60 to-cyan-300/50 shadow-[0_0_6px_rgba(74,222,128,0.4)]" /><h2 className="text-xs sm:text-sm font-display font-bold uppercase tracking-[0.18em] text-green-200/95 text-center [text-shadow:0_0_5px_rgba(74,222,128,0.65),0_0_12px_rgba(34,211,238,0.22)]">{title}</h2><div className="h-px flex-1 bg-gradient-to-l from-transparent via-green-400/60 to-pink-400/45 shadow-[0_0_6px_rgba(74,222,128,0.4)]" /></div>;
  const fieldClass = "mt-0.5 h-8 bg-black/75 border-white/25 text-xs transition-[border-color,box-shadow] duration-200 focus-visible:border-pink-400/70 focus-visible:ring-1 focus-visible:ring-pink-400/30 focus-visible:shadow-[0_0_8px_rgba(244,114,182,0.16)] motion-reduce:transition-none";
  const selectClass = "mt-0.5 w-full h-8 bg-black/75 border border-white/25 rounded-md px-2 text-xs text-white transition-[border-color,box-shadow] duration-200 focus:outline-none focus:border-purple-400/70 focus:ring-1 focus:ring-purple-400/30 focus:shadow-[0_0_8px_rgba(192,132,252,0.16)] motion-reduce:transition-none";
  const expansionMotion = reduceMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" as const };
  const neonButton = "transition-all duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-offset-black";
  const cardAccents = [
    "shadow-[inset_0_0_12px_rgba(244,114,182,0.05)] hover:border-pink-400/75 hover:shadow-[inset_0_0_14px_rgba(244,114,182,0.08),0_0_14px_rgba(244,114,182,0.2)] focus-within:border-pink-400/70",
    "shadow-[inset_0_0_12px_rgba(34,211,238,0.05)] hover:border-cyan-400/75 hover:shadow-[inset_0_0_14px_rgba(34,211,238,0.08),0_0_14px_rgba(34,211,238,0.2)] focus-within:border-cyan-400/70",
    "shadow-[inset_0_0_12px_rgba(74,222,128,0.05)] hover:border-green-400/75 hover:shadow-[inset_0_0_14px_rgba(74,222,128,0.08),0_0_14px_rgba(74,222,128,0.2)] focus-within:border-green-400/70",
    "shadow-[inset_0_0_12px_rgba(192,132,252,0.05)] hover:border-purple-400/75 hover:shadow-[inset_0_0_14px_rgba(192,132,252,0.08),0_0_14px_rgba(192,132,252,0.2)] focus-within:border-purple-400/70",
  ];
  const cardButtonAccents = [
    "border-pink-400/55 text-pink-100 hover:border-pink-300 hover:bg-pink-400/[0.07] hover:shadow-[0_0_8px_rgba(244,114,182,0.3)] focus-visible:ring-pink-300",
    "border-cyan-400/55 text-cyan-100 hover:border-cyan-300 hover:bg-cyan-400/[0.07] hover:shadow-[0_0_8px_rgba(34,211,238,0.3)] focus-visible:ring-cyan-300",
    "border-green-400/55 text-green-100 hover:border-green-300 hover:bg-green-400/[0.07] hover:shadow-[0_0_8px_rgba(74,222,128,0.3)] focus-visible:ring-green-300",
    "border-purple-400/55 text-purple-100 hover:border-purple-300 hover:bg-purple-400/[0.07] hover:shadow-[0_0_8px_rgba(192,132,252,0.3)] focus-visible:ring-purple-300",
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-3 space-y-1.5">
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid lg:grid-cols-[0.82fr_1.18fr] lg:h-[330px] border border-white/15 overflow-hidden bg-black shadow-[inset_0_0_24px_rgba(34,211,238,0.035)]">
          <div className="p-4 sm:px-5 sm:py-4 flex flex-col justify-center">
            <Link href="/" className={`inline-flex items-center gap-1.5 border border-white/25 rounded-sm px-2.5 py-1 text-[9px] uppercase text-white/65 hover:text-white hover:border-cyan-300/70 hover:shadow-[0_0_10px_rgba(34,211,238,0.25)] focus-visible:ring-cyan-300 w-fit mb-3 ${neonButton}`}><ArrowLeft className="w-3 h-3" /> Back</Link>
            <p className="text-green-400 text-xl sm:text-2xl lg:text-3xl font-display font-bold uppercase tracking-tight [text-shadow:0_0_6px_rgba(74,222,128,0.52),0_0_14px_rgba(74,222,128,0.2)]">Live Band Karaoke</p>
            <h1 className="mt-1.5 text-xl sm:text-2xl font-script leading-tight text-pink-400 text-glow-pink">You Sing The Hits,<br />We Bring The Band!</h1>
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div className="group"><PalmTreeIcon className="w-7 h-7 mx-auto text-pink-400/90 drop-shadow-[0_0_5px_rgba(244,114,182,0.55)] transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none" /><p className="text-[9px] uppercase text-green-400/80 mt-1">Rock · Pop<br />Soul · Reggae<br />Classics</p><p className="text-[9px] text-white/50 mt-0.5">and so much more!</p></div>
              <div className="group"><Users className="w-7 h-7 mx-auto text-cyan-300/90 drop-shadow-[0_0_5px_rgba(103,232,249,0.5)] transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none" /><p className="text-[9px] uppercase text-green-400/80 mt-1">All Skill Levels</p><p className="text-[9px] text-white/50 mt-1">Welcome</p></div>
              <div className="group"><Star className="w-7 h-7 mx-auto text-purple-400/90 drop-shadow-[0_0_5px_rgba(192,132,252,0.5)] transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none" /><p className="text-[9px] uppercase text-green-400/80 mt-1">Professional<br />Live Band</p></div>
            </div>
          </div>
          <div className="min-h-[240px] lg:min-h-0 bg-black flex items-center justify-center"><img src="/booking-hero-approved.jpg" alt="Guilty Pleasures stage, crowd, microphone, and lyric monitor" className="w-full h-full object-contain" /></div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="border border-pink-500/55 bg-black px-3 py-3 lg:px-4 lg:h-[250px] lg:overflow-hidden shadow-[inset_0_0_26px_rgba(236,72,153,0.045),0_0_14px_rgba(168,85,247,0.07)]">
          {submitted ? <div className="h-full flex items-center justify-center gap-3"><CheckCircle2 className="w-9 h-9 text-green-400" /><div><h2 className="font-display font-bold">Inquiry Sent!</h2><p className="text-xs text-white/55">Thanks — we'll be in touch soon.</p></div></div> :
            <div className="grid lg:grid-cols-[180px_1fr] gap-3 lg:gap-4 h-full">
              <div className="flex flex-col justify-between"><div><h2 className="text-base font-display font-semibold uppercase tracking-[0.075em] text-pink-300 [text-shadow:0_0_5px_rgba(244,114,182,0.55)]">Check Availability<br />&amp; Send an Inquiry</h2><p className="text-[11px] text-white/55 mt-2">Tell us about your event and we'll get back to you ASAP!</p></div><div className="hidden lg:flex h-[108px] items-center justify-center pr-3"><HandheldMicrophoneIcon className="w-20 h-24 translate-x-2 -translate-y-4 brightness-150 saturate-125 drop-shadow-[0_0_5px_rgba(192,132,252,0.55)]" /></div></div>
              <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-2 content-start">
                <label className="text-[10px] text-white/70">Your Name <span className="text-pink-400">*</span><Input name="name" value={form.name} onChange={handleChange} required placeholder="First and last name" className={fieldClass} data-testid="input-booking-name" /></label>
                <label className="text-[10px] text-white/70">Email <span className="text-pink-400">*</span><Input name="email" value={form.email} onChange={handleChange} required type="email" placeholder="name@email.com" className={fieldClass} data-testid="input-booking-email" /></label>
                <label className="text-[10px] text-white/70">Phone<Input name="phone" value={form.phone} onChange={handleChange} placeholder="(555) 123-4567" className={fieldClass} data-testid="input-booking-phone" /></label>
                <label className="text-[10px] text-white/70">Preferred Format <span className="text-pink-400">*</span><select name="preferredFormat" value={form.preferredFormat} onChange={handleChange} required className={selectClass} data-testid="select-booking-preferred-format"><option value="">Select Preferred Format</option><option>Full Band Experience</option><option>DUO</option><option>Jukebox Mode</option><option>Traditional Cover Band</option><option>Not Sure Yet</option></select></label>
                <label className="text-[10px] text-white/70">Event Type <span className="text-pink-400">*</span><select name="eventType" value={form.eventType} onChange={handleChange} required className={selectClass} data-testid="select-booking-event-type"><option value="">Select Event Type</option><option>Bar / Restaurant</option><option>Private Party</option><option>Corporate Event</option><option>Wedding</option><option>Festival</option><option>Other</option></select></label>
                <label className="text-[10px] text-white/70">Event Date <span className="text-pink-400">*</span><Input name="eventDate" value={form.eventDate} onChange={handleChange} required type="date" className={fieldClass} data-testid="input-booking-date" /></label>
                <label className="text-[10px] text-white/70">Expected Guest Count<Input name="expectedGuestCount" value={form.expectedGuestCount} onChange={handleChange} type="number" min="1" placeholder="Approximate number" className={fieldClass} data-testid="input-booking-guest-count" /></label>
                <label className="text-[10px] text-white/70">Performance Length<Input name="performanceLength" value={form.performanceLength} onChange={handleChange} placeholder="e.g. 2–3 hours" className={fieldClass} data-testid="input-booking-performance-length" /></label>
                <label className="text-[10px] text-white/70">Location / Venue <span className="text-pink-400">*</span><Input name="venue" value={form.venue} onChange={handleChange} required placeholder="City, state or venue" className={fieldClass} data-testid="input-booking-venue" /></label>
                <div className="sm:col-span-2 lg:col-span-3 lg:relative"><label className="block text-[10px] text-white/70">Additional Details<Textarea name="message" value={form.message} onChange={handleChange} rows={1} placeholder="Tell us anything else we should know about your event…" className="mt-0.5 min-h-[40px] lg:pr-40 bg-black/75 border-white/25 resize-none text-xs transition-[border-color,box-shadow] duration-200 focus-visible:border-pink-400/70 focus-visible:ring-1 focus-visible:ring-pink-400/30 focus-visible:shadow-[0_0_8px_rgba(244,114,182,0.16)] motion-reduce:transition-none" data-testid="textarea-booking-message" /></label><div className="flex justify-end mt-2 lg:mt-0 lg:absolute lg:right-1 lg:bottom-1"><NeonButton type="submit" isLoading={isPending} size="sm" className="h-7 min-w-36 !border-green-400/65 !text-green-200 !bg-green-400/[0.07] !shadow-[inset_0_0_8px_rgba(74,222,128,0.08)] hover:!border-green-300 hover:!bg-green-400/[0.12] hover:!shadow-[inset_0_0_8px_rgba(74,222,128,0.12),0_0_13px_rgba(74,222,128,0.32)] focus-visible:!ring-green-300 motion-reduce:!transition-none" data-testid="button-booking-submit">Send Inquiry <ChevronRight className="w-3 h-3" /></NeonButton></div></div>
              </form>
            </div>}
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={expanded ? "" : "lg:h-[150px] lg:overflow-hidden"}>
          {heading("Choose Your Experience")}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-1.5">
            {experiences.map((item, index) => { const Icon = icons[index]; const open = item.title === expandedExperience; return <article key={item.title} className={`group min-h-[126px] lg:h-[126px] border bg-black p-2 flex flex-col items-center text-center transition-all duration-200 motion-reduce:transition-none hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 ${cardAccents[index]} ${open ? "border-green-400/60" : "border-white/25"}`}><Icon className={`w-6 h-6 mb-1 transition-[transform,filter] duration-200 motion-reduce:transition-none group-hover:scale-110 group-hover:brightness-125 ${index === 0 ? "text-pink-400 drop-shadow-[0_0_5px_rgba(244,114,182,0.5)]" : index === 1 ? "text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" : index === 2 ? "text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]" : "text-purple-400 drop-shadow-[0_0_5px_rgba(192,132,252,0.5)]"}`} /><h3 className="text-[11px] font-display font-bold uppercase leading-tight tracking-wide text-white/90 transition-colors duration-200 group-hover:text-white motion-reduce:transition-none">{item.title}</h3><p className="text-[10px] text-green-400/80 mt-1 leading-tight">{item.tagline}</p><p className="text-[9px] text-white/60 mt-0.5 leading-tight">{item.summary}</p><button type="button" aria-expanded={open} aria-controls="experience-details" onClick={() => setExpandedExperience(open ? null : item.title)} className={`mt-auto border px-3 py-0.5 text-[8px] uppercase tracking-wider ${cardButtonAccents[index]} ${neonButton}`}>{open ? "Hide Details" : "View Details"}</button></article>; })}
          </div>
          <AnimatePresence initial={false}>{expanded && <motion.div id="experience-details" key={expanded.title} initial={reduceMotion ? false : { opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -4 }} transition={expansionMotion} className="border border-green-400/30 border-t-0 bg-black p-4 space-y-2 text-sm text-white/75">{expanded.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</motion.div>}</AnimatePresence>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`group border border-amber-500/60 bg-black px-3 shadow-[inset_0_0_14px_rgba(251,146,60,0.065),0_0_8px_rgba(251,191,36,0.09)] transition-shadow duration-200 hover:shadow-[inset_0_0_16px_rgba(251,146,60,0.1),0_0_14px_rgba(251,191,36,0.22)] motion-reduce:transition-none ${showGuitar ? "py-2" : "py-2 lg:py-0 lg:h-[42px] lg:overflow-hidden"}`}>
          <div className="min-h-10 lg:h-10 flex flex-col sm:flex-row sm:items-center gap-2"><ElectricGuitarAltIcon className="w-7 h-7 text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)] shrink-0 transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none" /><div className="flex-1"><h2 className="text-[11px] font-display font-semibold uppercase tracking-[0.1em] text-amber-200 [text-shadow:0_0_6px_rgba(251,191,36,0.38)]">Add Guitar-i-Oke™ to Any Format!</h2><p className="text-[9px] text-white/55">Add a second guitar rig, chord charts on screen, and let your guests sign up to sit in and play.</p></div><button type="button" aria-expanded={showGuitar} aria-controls="guitar-details" onClick={() => setShowGuitar(value => !value)} className={`border border-amber-400/50 px-4 py-1 text-[8px] uppercase text-amber-200 self-start sm:self-auto hover:border-amber-300 hover:shadow-[0_0_8px_rgba(251,191,36,0.3)] focus-visible:ring-amber-300 ${neonButton}`}>{showGuitar ? "Hide Details" : "Learn More"}</button></div>
          <AnimatePresence initial={false}>{showGuitar && <motion.div id="guitar-details" initial={reduceMotion ? false : { opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -4 }} transition={expansionMotion} className="pt-2 border-t border-amber-400/20 space-y-2 text-sm text-white/75">{guitarParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</motion.div>}</AnimatePresence>
        </motion.section>

        {(page.photos.length > 0 || page.videos.length > 0) && (
          <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="h-[150px] overflow-hidden">
            {heading("This Is How We Do It")}
            <div className="relative h-[126px] px-4">
              <button type="button" onClick={() => moveMedia(-1)} aria-label="Previous media" className={`absolute left-0 top-1/2 z-10 -translate-y-1/2 w-6 h-8 flex items-center justify-center rounded-full border border-white/30 bg-black/80 text-white/70 hover:text-cyan-200 hover:border-cyan-300/70 focus-visible:ring-cyan-300 ${neonButton}`}><ChevronLeft className="w-4 h-4" /></button>
              <div ref={mediaStripRef} className={`h-full flex gap-1.5 overflow-x-auto scroll-smooth motion-reduce:scroll-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${mediaItems.length < 6 ? "lg:justify-center" : ""}`}>
              {mediaItems.map(item => {
                if (item.type === "photo") return (
                  <div key={`photo-${item.index}`} data-display-mode={displayMode} className="relative group h-full shrink-0 basis-[46%] sm:basis-[30%] lg:basis-[calc((100%-1.875rem)/6)] lg:max-w-[calc((100%-1.875rem)/6)] border border-white/20 overflow-hidden bg-zinc-950 shadow-[inset_0_0_10px_rgba(255,255,255,0.025)] transition-all duration-200 hover:-translate-y-px hover:border-cyan-300/60 hover:shadow-[0_0_10px_rgba(34,211,238,0.18)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                    <img src={item.src} alt={`Guilty Pleasures performance ${item.index + 1}`} className="w-full h-full object-cover transition-[transform,filter] duration-200 group-hover:scale-[1.025] group-hover:brightness-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
                    <span className="absolute inset-0 pointer-events-none bg-black/10 ring-1 ring-inset ring-white/[0.04] transition-colors duration-200 group-hover:bg-transparent motion-reduce:transition-none" />
                  </div>
                );
                const video = item.video;
                const index = item.index;
                const id = getYouTubeId(video.url);
                const embedUrl = getYouTubeEmbedUrl(video.url);
                if (!id || !embedUrl) return null;
                const playing = activeVideo === index;
                return (
                  <div key={`video-${index}`} className="relative group h-full shrink-0 basis-[46%] sm:basis-[30%] lg:basis-[calc((100%-1.875rem)/6)] lg:max-w-[calc((100%-1.875rem)/6)] border border-white/20 overflow-hidden bg-zinc-950 shadow-[inset_0_0_10px_rgba(255,255,255,0.025)] transition-all duration-200 hover:-translate-y-px hover:border-pink-300/60 hover:shadow-[0_0_10px_rgba(244,114,182,0.18)] focus-within:border-pink-300/60 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                    {playing ? (
                      <iframe src={embedUrl} title={video.title || `Performance video ${index + 1}`} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    ) : (
                      <button type="button" onClick={() => setActiveVideo(index)} aria-label={`Play ${video.title || `performance video ${index + 1}`}`} className="relative w-full h-full overflow-hidden focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-pink-300">
                        <img src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`} alt="" className="w-full h-full object-cover opacity-80 transition-[transform,opacity] duration-200 group-hover:scale-[1.025] group-hover:opacity-95 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
                        <span className="absolute inset-0 bg-black/20" />
                        <span className="absolute inset-0 flex items-center justify-center"><span className="w-9 h-9 rounded-full border border-pink-300/70 bg-black/70 flex items-center justify-center shadow-[0_0_12px_rgba(244,114,182,0.35)] transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none"><Play className="w-4 h-4 ml-0.5 text-pink-300 fill-pink-300/25" /></span></span>
                        <span className="absolute left-2 bottom-2 flex items-center gap-1 text-[9px] bg-black/75 px-1.5 py-0.5 text-pink-100">{video.title || "Live in Action"}</span>
                      </button>
                    )}
                  </div>
                );
              })}
              </div>
              <button type="button" onClick={() => moveMedia(1)} aria-label="Next media" className={`absolute right-0 top-1/2 z-10 -translate-y-1/2 w-6 h-8 flex items-center justify-center rounded-full border border-white/30 bg-black/80 text-white/70 hover:text-cyan-200 hover:border-cyan-300/70 focus-visible:ring-cyan-300 ${neonButton}`}><ChevronRight className="w-4 h-4" /></button>
            </div>
          </motion.section>
        )}

        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`group border border-green-500/55 bg-black px-3 shadow-[inset_0_0_16px_rgba(34,211,238,0.055),0_0_8px_rgba(74,222,128,0.085)] transition-shadow duration-200 hover:shadow-[inset_0_0_18px_rgba(34,211,238,0.08),0_0_14px_rgba(74,222,128,0.21)] motion-reduce:transition-none ${showStory ? "py-2" : "py-2 lg:py-0 lg:h-[65px] lg:overflow-hidden"}`}>
          <div className="min-h-[63px] lg:h-[63px] flex flex-col sm:flex-row sm:items-center gap-2"><div className="w-9 h-9 rounded-full border border-green-400/60 shadow-[inset_0_0_8px_rgba(74,222,128,0.08),0_0_8px_rgba(74,222,128,0.16)] flex items-center justify-center shrink-0"><TbGuitarPick className="w-6 h-6 text-green-300 drop-shadow-[0_0_4px_rgba(74,222,128,0.55)] transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none" /></div><div className="flex-1 min-w-0"><h2 className="text-[11px] font-display font-semibold uppercase tracking-[0.14em] text-green-300/95 [text-shadow:0_0_5px_rgba(74,222,128,0.34)]">Our Story &amp; Experience</h2><p className="text-[8px] text-white/55 leading-[1.15] max-w-2xl">Founded by producer and musician Joe Little, Guilty Pleasures combines professional musicianship, production experience, and a constantly evolving song catalog to bring musicians and music lovers together onstage — turning ordinary events into memorable, shared live-music experiences.</p></div><div className="shrink-0 flex flex-col items-end gap-1"><button type="button" aria-expanded={showStory} aria-controls="story-details" onClick={() => setShowStory(value => !value)} className={`border border-green-400/50 px-4 py-1 text-[8px] uppercase text-green-300 hover:border-green-300 hover:shadow-[0_0_8px_rgba(74,222,128,0.3)] focus-visible:ring-green-300 ${neonButton}`}>{showStory ? "Hide Our Story" : "Read Our Story"}</button><a href="https://www.instagram.com/guiltypleasuresliveband" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[7px] text-white/45 hover:text-pink-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-300"><Instagram className="w-2.5 h-2.5 text-pink-400" />@guiltypleasuresliveband</a></div></div>
          <AnimatePresence initial={false}>{showStory && <motion.div id="story-details" initial={reduceMotion ? false : { opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -4 }} transition={expansionMotion} className="pt-2 border-t border-green-400/20 space-y-2 text-sm text-white/75">{storyParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</motion.div>}</AnimatePresence>
        </motion.section>
      </main>
    </div>
  );
}
