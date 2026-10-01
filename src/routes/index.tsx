import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, Check, Download, ExternalLink, ImagePlus, Link2, Sparkles, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import heroAsset from "@/assets/lesgo-hero.asset.json";
import logoAsset from "@/assets/lesgo-logo.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lesgo Meme Engine — Make memes. Make noise." },
      { name: "description", content: "Make a Lesgo meme, post it, and get ready for community rewards. The louder your meme goes, the bigger the opportunity." },
      { property: "og:title", content: "Lesgo Meme Engine — Make memes. Make noise." },
      { property: "og:description", content: "Make a Lesgo meme, post it, and get ready for community rewards." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const hero = heroAsset.url;
const logo = logoAsset.url;
const tickerItems = ["MAKE A MEME", "POST IT", "MAKE NOISE", "EARN $GO", "GO VIRAL", "WIN MORE"];

function drawWrappedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.trim().toUpperCase().split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const trial = line ? `${line} ${word}` : word;
    if (ctx.measureText(trial).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = trial;
  }
  if (line) lines.push(line);
  lines.forEach((item, index) => ctx.strokeText(item, x, y + index * lineHeight, maxWidth));
  lines.forEach((item, index) => ctx.fillText(item, x, y + index * lineHeight, maxWidth));
}

function MemeEngine() {
  const [template, setTemplate] = useState<"hero" | "logo" | "upload">("hero");
  const [uploaded, setUploaded] = useState<string | null>(null);
  const [topText, setTopText] = useState("WHEN THE GROUP CHAT SAYS");
  const [bottomText, setBottomText] = useState("LES GOOOO");
  const [downloaded, setDownloaded] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const currentImage = template === "upload" && uploaded ? uploaded : template === "logo" ? logo : hero;

  function handleUpload(file?: File) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setUploaded(reader.result);
        setTemplate("upload");
      }
    };
    reader.readAsDataURL(file);
  }

  async function downloadMeme() {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = currentImage;
    try {
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 900;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const scale = Math.max(canvas.width / image.width, canvas.height / image.height);
      const width = image.width * scale;
      const height = image.height * scale;
      ctx.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#10100e";
      ctx.lineWidth = 12;
      ctx.lineJoin = "round";
      ctx.font = "900 72px Impact, 'Arial Black', sans-serif";
      ctx.textBaseline = "top";
      drawWrappedText(ctx, topText, 600, 44, 1100, 80);
      ctx.textBaseline = "bottom";
      const bottomLines = bottomText.trim().toUpperCase().split(/\s+/);
      let approximateLines = 1;
      let current = "";
      for (const word of bottomLines) {
        const trial = current ? `${current} ${word}` : word;
        if (ctx.measureText(trial).width > 1100 && current) { approximateLines++; current = word; } else current = trial;
      }
      drawWrappedText(ctx, bottomText, 600, 850 - (approximateLines - 1) * 80, 1100, 80);
      const anchor = document.createElement("a");
      anchor.download = "lesgo-meme.png";
      anchor.href = canvas.toDataURL("image/png");
      anchor.click();
      setDownloaded(true);
    } catch {
      alert("Could not export this image. Please try another template.");
    }
  }

  return (
    <section id="engine" className="engine-section scroll-mt-20">
      <div className="section-shell">
        <div className="section-kicker"><span className="status-dot" /> THE MEME ENGINE / OPEN FOR BUSINESS</div>
        <div className="engine-heading-row">
          <div><h2>YOUR IDEA.<br /><span>OUR CANVAS.</span></h2><p>Make something the timeline can’t ignore.</p></div>
          <div className="engine-counter">01 / CREATE<br /><span>NO DESIGN DEGREE REQUIRED</span></div>
        </div>
        <div className="engine-grid">
          <div className="engine-preview-wrap">
            <div className="preview-topline"><span>LIVE PREVIEW</span><span>1200 × 900 EXPORT</span></div>
            <div className="meme-preview" aria-label="Meme preview">
              <img src={currentImage} alt="Current meme template" />
              {topText && <div className="meme-text meme-text-top">{topText}</div>}
              {bottomText && <div className="meme-text meme-text-bottom">{bottomText}</div>}
            </div>
            <div className="preview-bottomline"><span>✳ MADE FOR THE GROUP CHAT</span><span>LESGO.FUN</span></div>
          </div>
          <div className="engine-controls">
            <div className="control-group">
              <div className="control-label"><span>01</span> PICK YOUR STARTING POINT</div>
              <div className="template-options">
                <Button type="button" variant="ghost" className={`template-option ${template === "hero" ? "is-selected" : ""}`} onClick={() => setTemplate("hero")} aria-pressed={template === "hero"}><img src={hero} alt="" /><span>THE CREW</span></Button>
                <Button type="button" variant="ghost" className={`template-option ${template === "logo" ? "is-selected" : ""}`} onClick={() => setTemplate("logo")} aria-pressed={template === "logo"}><img src={logo} alt="" /><span>THE WINK</span></Button>
                <Button type="button" variant="ghost" className={`template-option template-upload ${template === "upload" ? "is-selected" : ""}`} onClick={() => fileInput.current?.click()}><ImagePlus size={22} /><span>YOUR IMAGE</span></Button>
                <input ref={fileInput} type="file" accept="image/*" className="sr-only" aria-label="Upload your image" onChange={(event) => handleUpload(event.target.files?.[0])} />
              </div>
            </div>
            <div className="control-group"><label className="control-label" htmlFor="top-text"><span>02</span> TOP LINE</label><input id="top-text" className="meme-input" maxLength={80} value={topText} onChange={(event) => { setTopText(event.target.value); setDownloaded(false); }} placeholder="THE SETUP GOES HERE" /><div className="input-count">{topText.length} / 80</div></div>
            <div className="control-group"><label className="control-label" htmlFor="bottom-text"><span>03</span> BOTTOM LINE</label><input id="bottom-text" className="meme-input" maxLength={80} value={bottomText} onChange={(event) => { setBottomText(event.target.value); setDownloaded(false); }} placeholder="THE PUNCHLINE GOES HERE" /><div className="input-count">{bottomText.length} / 80</div></div>
            <Button type="button" className="download-button" onClick={downloadMeme}><Download size={19} /> DOWNLOAD YOUR MEME <ArrowRight size={20} /></Button>
            {downloaded && <div className="download-success"><Check size={15} /> Meme saved. Post it and tag Lesgo when you’re ready.</div>}
            <p className="control-footnote">Make it yours. Keep it original. The internet handles the rest.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Index() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqs = [
    { question: "How do I earn $GO?", answer: "The idea is simple: create original Lesgo memes and share them publicly. The reward program’s exact tracking, eligibility, and payout details will be announced through official Lesgo channels. Downloading or posting a meme on this page does not automatically register a reward." },
    { question: "What if my meme goes viral?", answer: "The biggest community hits are intended to unlock more rewards. How viral performance is measured and what extra prizes are available will be shared before rewards begin." },
    { question: "Do I need to buy a token to make a meme?", answer: "No. You can use this meme maker and download your creation without connecting a wallet or buying anything." },
    { question: "Where should I post it?", answer: "Post your original meme on your own public social account. You can share to X from this page after downloading your image. Watch Lesgo’s official channels for participation instructions." },
  ];
  return <main>
    <header className="site-header">
      <div className="header-inner"><a href="https://www.lesgo.fun/" className="brand" aria-label="Lesgo home"><img src={logo} alt="" /><span>LESGO<span className="brand-period">.</span></span></a><nav aria-label="Page navigation"><a href="#how-it-works">HOW IT WORKS</a><a href="#engine">MEME ENGINE</a><a href="#faq">FAQ</a></nav><a className="header-action" href="#engine">MAKE A MEME <ArrowRight size={16} /></a></div>
    </header>
    <section className="hero-section">
      <div className="hero-grid section-shell">
        <div className="hero-copy"><div className="eyebrow"><span className="status-dot" /> THE LESGO MEME ENGINE <span className="eyebrow-line" /> 001</div><h1>MAKE MEMES.<br /><span>MAKE NOISE.</span><br />MAKE $GO.</h1><p className="hero-description">The best ideas deserve more than likes. Make a meme. Put it out there. Earn $GO for showing up — and even more when the internet runs with it.</p><div className="hero-buttons"><a className="primary-link" href="#engine">START CREATING <ArrowRight size={19} /></a><a className="secondary-link" href="#how-it-works">HOW IT WORKS <ArrowDown size={17} /></a></div><div className="hero-notes"><span><i /> CREATE FOR FREE</span><span><i /> POST YOUR MEME</span><span><i /> GO BIGGER</span></div></div>
        <div className="hero-visual"><div className="image-sticker">GOOD IDEAS<br />GO PLACES. ↗</div><div className="hero-image-frame"><img src={hero} alt="Lesgo’s yellow mascot with its black cat and hooded friends against a bright yellow city skyline" /></div><div className="image-caption"><span>FIG. 01 — THE INTERNET’S NEW FAVORITE CREW</span><span>☺</span></div></div>
      </div>
      <div className="hero-index">SCROLL TO GET IN ON IT <ArrowDown size={14} /></div>
    </section>
    <div className="ticker" aria-label="Make a meme, post it, earn GO, go viral, win more"><div className="ticker-track">{[...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems].map((item, index) => <span key={`${item}-${index}`}>{item} <b>✳</b></span>)}</div></div>
    <section id="how-it-works" className="how-section scroll-mt-20"><div className="section-shell"><div className="section-kicker"><span className="status-dot" /> THE PLAYBOOK / THREE MOVES</div><div className="how-intro"><h2>POST SOMETHING<br /><span>WORTH SHARING.</span></h2><p>No secret formula. Just a good meme and a little main-character energy.</p></div><div className="steps-grid"><article className="step"><div className="step-top"><span>01 / CREATE</span><Sparkles size={24} /></div><h3>MAKE IT.</h3><p>Start with the Lesgo crew or upload your own image. Add a line. Make it yours.</p><a href="#engine">OPEN THE ENGINE <ArrowRight size={16} /></a></article><article className="step"><div className="step-top"><span>02 / SHARE</span><ExternalLink size={24} /></div><h3>POST IT.</h3><p>Take your meme to the timeline. Original posts, real people, good chaos.</p><a href="https://x.com/intent/post?text=Made%20something%20for%20%40lesgofun%20%F0%9F%98%8E%20%23Lesgo" target="_blank" rel="noreferrer">POST ON X <ArrowRight size={16} /></a></article><article className="step"><div className="step-top"><span>03 / EARN</span><span className="step-spark">✳</span></div><h3>LET IT FLY.</h3><p>Earn for participating. If your meme takes off, there’s more to play for.</p><a href="#faq">THE DETAILS <ArrowRight size={16} /></a></article></div></div></section>
    <section className="reward-band"><div className="section-shell reward-inner"><div><div className="reward-label">THE WHOLE IDEA IN ONE LINE</div><h2>GOOD MEMES MOVE.<br /><span>GREAT MEMES PAY.</span></h2></div><div className="reward-side"><span className="reward-star">✳</span><p>Make it for the culture.<br />Get rewarded for the reach.</p><small>Reward rules and eligibility to be announced.</small></div></div></section>
    <MemeEngine />
    <section className="share-section"><div className="section-shell share-inner"><div><div className="section-kicker">02 / PUT IT OUT THERE</div><h2>MADE IT?<br /><span>LET IT LOOSE.</span></h2><p>Download your meme, post it on your own feed, and let the timeline do its thing.</p></div><a className="share-action" href="https://x.com/intent/post?text=Made%20something%20for%20%40lesgofun%20%F0%9F%98%8E%20%23Lesgo" target="_blank" rel="noreferrer"><X size={20} /> POST ON X <ArrowRight size={19} /></a></div></section>
    <section id="faq" className="faq-section scroll-mt-20"><div className="section-shell faq-inner"><div><div className="section-kicker">THE FINE PRINT / NO GUESSWORK</div><h2>STRAIGHT<br />ANSWERS<span>.</span></h2><p>More details are coming. Here’s what you need to know right now.</p></div><div className="faq-list">{faqs.map((faq, index) => <div className="faq-item" key={faq.question}><Button type="button" variant="ghost" className="faq-question" aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? null : index)}><span><small>0{index + 1}</small>{faq.question}</span><span className="faq-toggle">{openFaq === index ? "−" : "+"}</span></Button>{openFaq === index && <p>{faq.answer}</p>}</div>)}</div></div></section>
    <footer><div className="section-shell footer-inner"><div className="footer-top"><div><div className="section-kicker">ONE MORE THING</div><h2>ENOUGH SCROLLING.<br /><span>MAKE A MEME.</span></h2><a className="primary-link" href="#engine">LET’S GO <ArrowRight size={19} /></a></div><img src={logo} alt="Lesgo wink logo" /></div><div className="footer-bottom"><a href="https://www.lesgo.fun/" className="footer-brand">LESGO<span>.</span></a><span>GOOD IDEAS GO PLACES.</span><div><a href="https://www.lesgo.fun/">LESGO.FUN <ExternalLink size={13} /></a><a href="https://www.lesgo.fun/docs">DOCS <Link2 size={13} /></a></div></div></div></footer>
  </main>;
}
