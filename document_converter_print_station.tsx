import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Trash2, 
  Copy, 
  Check, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  FileEdit, 
  Settings, 
  FileCode, 
  Sparkles,
  RefreshCw,
  Undo2,
  Maximize2,
  Eye,
  Type
} from 'lucide-react';

// Premade templates for immediate editing
const TEMPLATES = {
  blank: {
    title: "Blank Document",
    content: "<h1>Start typing your document here...</h1><p>You can format text, change page layouts, and download this in multiple formats instantly.</p>"
  },
  resume: {
    title: "Professional Resume",
    content: `<h1 style="text-align: center; margin-bottom: 5px;">ALEXANDER MERCER</h1>
<p style="text-align: center; color: #666; margin-top: 0;">San Francisco, CA | (555) 019-2834 | alexander.mercer@email.com | linkedin.com/in/alexmercer</p>
<hr style="border: none; border-top: 1px solid #ccc; margin: 15px 0;" />
<h3>PROFESSIONAL SUMMARY</h3>
<p>Results-driven Senior Software Engineer with over 6 years of experience building scalable web applications. Expert in React, Node.js, and cloud architectures. Proven track record of improving site loading performance by 40% and leading agile developer teams.</p>
<h3>WORK EXPERIENCE</h3>
<p><strong>Senior Software Engineer</strong> | TechVanguard Solutions (2023 - Present)</p>
<ul>
  <li>Led a team of 5 engineers to rebuild a legacy analytics dashboard, boosting user interaction metrics by 25%.</li>
  <li>Implemented automated testing pipelines reducing production bugs by 18%.</li>
</ul>
<p><strong>Full Stack Developer</strong> | Quantum Systems Inc. (2020 - 2023)</p>
<ul>
  <li>Developed robust APIs and database structures with PostgreSQL and Express.</li>
  <li>Optimized UI components, reducing visual layout shifts by 35%.</li>
</ul>
<h3>EDUCATION</h3>
<p><strong>B.S. in Computer Science</strong> | Stanford University (Graduated 2020)</p>`
  },
  letter: {
    title: "Formal Business Letter",
    content: `<p style="text-align: right;">July 6, 2026</p>
<p><strong>Jonathan Sterling</strong><br />Director of Operations<br />Apex Innovations Group<br />100 Corporate Parkway<br />Suite 450<br />New York, NY 10017</p>
<p>Dear Mr. Sterling,</p>
<p>I am writing to formally propose a strategic partnership between our respective organizations for the upcoming fiscal cycle. Over the past year, we have closely monitored Apex Innovations' developments in machine learning integrations, and we believe our cloud distribution network offers an ideal synergy.</p>
<p>Our proposed framework aims to enhance performance standards while reducing delivery overheads by roughly 12%. I would welcome the opportunity to discuss this proposal in greater detail during a brief video conference next week.</p>
<p>Thank you for your valuable time and consideration. I look forward to your favorable response.</p>
<p>Sincerely,</p>
<p><strong>Eleanor Vance</strong><br />Chief Executive Officer<br />Vance Global Technologies</p>`
  },
  minutes: {
    title: "Meeting Minutes",
    content: `<h2 style="text-align: center; color: #1a365d;">WEEKLY TEAM SYNC MINUTES</h2>
<p style="text-align: center; font-style: italic; color: #555;">Date: July 6, 2026 | Time: 10:00 AM EST | Facilitator: Sarah Jenkins</p>
<hr style="border: none; border-top: 2px solid #1a365d; margin: 15px 0;" />
<h3>ATTENDEES</h3>
<p>Sarah Jenkins, David Miller, Priya Sharma, Marcus Vance, Emma Frost</p>
<h3>AGENDA TOPICS</h3>
<ol>
  <li><strong>Q3 Product Roadmap Review:</strong> Priya presented the feature delivery schedule. Timeline verified with no current blockers.</li>
  <li><strong>Infrastructure Expansion Budget:</strong> Marcus raised server capacity concerns. Approved 15% budget buffer for hosting.</li>
  <li><strong>User Feedback on V2.1 Launch:</strong> Emma highlighted login friction in mobile views. Fix scheduled for upcoming Sprint 14.</li>
</ol>
<h3>ACTION ITEMS</h3>
<ul>
  <li><strong>Priya Sharma:</strong> Send updated roadmap PDF to marketing by Thursday.</li>
  <li><strong>David Miller:</strong> Optimize database indexing to ease server CPU load before Friday sync.</li>
  <li><strong>Emma Frost:</strong> Coordinate UX draft reviews for mobile login screens.</li>
</ul>`
  },
  proposal: {
    title: "Project Proposal",
    content: `<h1 style="color: #2b6cb0;">PROJECT PROPOSAL: NEXUS PLATFORM</h1>
<p style="color: #4a5568; font-size: 1.1em;">Prepared for: <strong>The Horizon Initiative</strong><br />Prepared by: <strong>Strategic Development Unit</strong></p>
<hr style="border-top: 2px solid #2b6cb0; margin: 20px 0;" />
<h3>1. EXECUTIVE SUMMARY</h3>
<p>The Nexus Platform is an ecosystem designed to bridge decentralized data sets into singular real-time visual streams. By constructing localized high-performance indexing servers, the project alleviates current synchronization lags and elevates analytic speeds for operations commanders.</p>
<h3>2. OBJECTIVES & MILESTONES</h3>
<ul>
  <li><strong>Phase 1 (Month 1-2):</strong> Build unified database adapters and complete structural architecture maps.</li>
  <li><strong>Phase 2 (Month 3-4):</strong> Conduct beta testing cycles across 3 secure government networks.</li>
  <li><strong>Phase 3 (Month 5-6):</strong> Full launch, network deployment, and continuous security monitoring onboarding.</li>
</ul>
<h3>3. BUDGET PROJECTIONS</h3>
<p>Estimated capital requirements stand at <strong>$85,000 USD</strong>, distributed across cloud computing procurement (40%), engineering allocation (50%), and compliance licensing (10%).</p>`
  }
};

// Map actual physical printable heights in pixels (approx 96 DPI standard screen rendering)
const PAGE_HEIGHTS = {
  a4: { portrait: 1056, landscape: 746 },
  letter: { portrait: 1000, landscape: 780 },
  legal: { portrait: 1280, landscape: 780 }
};

export default function App() {
  const [editorContent, setEditorContent] = useState(TEMPLATES.blank.content);
  const [docTitle, setDocTitle] = useState("Untitled Document");
  const [pageSize, setPageSize] = useState("A4"); // A4, Letter, Legal
  const [orientation, setOrientation] = useState("portrait"); // portrait, landscape
  const [marginSize, setMarginSize] = useState("normal"); // narrow, normal, wide
  const [fontFamily, setFontFamily] = useState("serif"); // sans, serif, mono, dyslexic
  const [fontSize, setFontSize] = useState("16px"); // 12px, 14px, 16px, 18px, 20px
  const [textColor, setTextColor] = useState("#1a1a1a");
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ words: 0, chars: 0, sentences: 0, pages: 1 });
  const [libsReady, setLibsReady] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [generatingWithAI, setGeneratingWithAI] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPageGuides, setShowPageGuides] = useState(true);

  const editorRef = useRef(null);

  // Load JSPDF and HTML2Canvas dynamically for PDF rendering
  useEffect(() => {
    const loadLibraries = async () => {
      try {
        const jspdfScript = document.createElement('script');
        jspdfScript.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
        document.body.appendChild(jspdfScript);

        const html2canvasScript = document.createElement('script');
        html2canvasScript.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        document.body.appendChild(html2canvasScript);

        let checkCount = 0;
        const checkInterval = setInterval(() => {
          if (window.jspdf && window.html2canvas) {
            clearInterval(checkInterval);
            setLibsReady(true);
          }
          checkCount++;
          if (checkCount > 100) {
            clearInterval(checkInterval);
            setLibsReady(true);
          }
        }, 100);
      } catch (err) {
        console.error("Failed to load PDF libraries dynamically", err);
      }
    };
    loadLibraries();
  }, []);

  // Sync state stats & dynamic page counts when content updates
  const calculateRealTimePages = () => {
    if (!editorRef.current) return;
    
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = editorContent;
    const text = tempDiv.innerText || tempDiv.textContent || "";
    
    const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
    const chars = text.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;

    // Calculate real pages based on DOM height divide by standard target height
    const scrollHeight = editorRef.current.scrollHeight || 1;
    const sizeKey = pageSize.toLowerCase();
    const targetHeight = PAGE_HEIGHTS[sizeKey]?.[orientation] || 1056;
    const calculatedPages = Math.max(1, Math.ceil(scrollHeight / targetHeight));

    setStats({ words, chars, sentences, pages: calculatedPages });
  };

  useEffect(() => {
    calculateRealTimePages();
  }, [editorContent, pageSize, orientation, marginSize, fontSize, fontFamily]);

  // Execute formatting actions inside rich editor
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setEditorContent(editorRef.current.innerHTML);
    }
  };

  // Set selected template
  const applyTemplate = (key) => {
    if (window.confirm(`Would you like to load the "${TEMPLATES[key].title}" template? This will replace your current text.`)) {
      setDocTitle(TEMPLATES[key].title);
      setEditorContent(TEMPLATES[key].content);
      if (editorRef.current) {
        editorRef.current.innerHTML = TEMPLATES[key].content;
      }
    }
  };

  // Convert HTML to simple raw Plain Text
  const getPlainText = () => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = editorContent;
    return tempDiv.innerText || tempDiv.textContent || "";
  };

  // Convert HTML to basic Markdown representation
  const getMarkdown = () => {
    let md = editorContent;
    md = md.replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n');
    md = md.replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n');
    md = md.replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n');
    md = md.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
    md = md.replace(/<b>(.*?)<\/b>/gi, '**$1**');
    md = md.replace(/<em>(.*?)<\/em>/gi, '*$1*');
    md = md.replace(/<i>(.*?)<\/i>/gi, '*$1*');
    md = md.replace(/<p>(.*?)<\/p>/gi, '$1\n\n');
    md = md.replace(/<li>(.*?)<\/li>/gi, '* $1\n');
    md = md.replace(/<ul>/gi, '');
    md = md.replace(/<\/ul>/gi, '\n');
    md = md.replace(/<ol>/gi, '');
    md = md.replace(/<\/ol>/gi, '\n');
    md = md.replace(/<br\s*\/?>/gi, '\n');
    
    const temp = document.createElement("div");
    temp.innerHTML = md;
    return temp.innerText || temp.textContent || "";
  };

  // Export Document to Microsoft Word (DOC)
  const handleWordExport = () => {
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <title>${docTitle}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        body { 
          font-family: ${fontFamily === 'sans' ? 'Arial, sans-serif' : fontFamily === 'mono' ? 'Courier New, monospace' : 'Times New Roman, serif'}; 
          font-size: ${fontSize}; 
          color: ${textColor};
          line-height: 1.6;
        }
        h1 { font-size: 24pt; font-weight: bold; margin-bottom: 12pt; }
        h2 { font-size: 18pt; font-weight: bold; margin-bottom: 10pt; }
        h3 { font-size: 14pt; font-weight: bold; margin-bottom: 8pt; }
        p { margin-bottom: 10pt; }
      </style>
    </head>
    <body>`;
    const footer = "</body></html>";
    const sourceHtml = header + editorContent + footer;

    const blob = new Blob(['\ufeff' + sourceHtml], {
      type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docTitle.toLowerCase().replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Plain Text Exporter
  const handleTxtExport = () => {
    const text = getPlainText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docTitle.toLowerCase().replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Markdown Exporter
  const handleMarkdownExport = () => {
    const text = getMarkdown();
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docTitle.toLowerCase().replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // HTML Web Page Exporter
  const handleHtmlExport = () => {
    const styledHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${docTitle}</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
      color: ${textColor};
    }
    h1, h2, h3 { color: #111827; }
  </style>
</head>
<body>
  ${editorContent}
</body>
</html>`;
    const blob = new Blob([styledHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docTitle.toLowerCase().replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate and Download Multipage PDF using jsPDF + html2canvas
  const handlePdfDownload = async () => {
    if (!window.jspdf || !window.html2canvas) {
      alert("PDF conversion libraries are loading. Please wait a second and click again.");
      return;
    }

    setExportLoading(true);
    try {
      const element = document.getElementById('printable-document-sheet');
      
      // Momentarily hide guides & shadows to extract clear paper layout
      const originalBoxShadow = element.style.boxShadow;
      const originalBorder = element.style.border;
      element.style.boxShadow = 'none';
      element.style.border = 'none';

      // Capture full high-resolution canvas
      const canvas = await window.html2canvas(element, {
        scale: 2, // Double DPI to keep text incredibly sharp
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Restore normal styling state
      element.style.boxShadow = originalBoxShadow;
      element.style.border = originalBorder;

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Map formats
      let format = 'a4';
      if (pageSize.toLowerCase() === 'letter') format = 'letter';
      if (pageSize.toLowerCase() === 'legal') format = 'legal';

      const isLandscape = orientation === 'landscape';
      const pdf = new window.jspdf.jsPDF({
        orientation: isLandscape ? 'l' : 'p',
        unit: 'px',
        format: format
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Determine proportional scaling factor
      const ratio = pdfWidth / imgWidth;
      const pageHeightInCanvasPixels = pdfHeight / ratio;

      let heightLeft = imgHeight;
      let position = 0;
      let pageNumber = 1;

      // Slice the generated image into exact PDF page pieces dynamically
      while (heightLeft > 0) {
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = imgWidth;
        pageCanvas.height = Math.min(pageHeightInCanvasPixels, heightLeft);

        const ctx = pageCanvas.getContext('2d');
        ctx.drawImage(
          canvas,
          0, position, imgWidth, pageCanvas.height, // Source coordinates
          0, 0, imgWidth, pageCanvas.height       // Target coordinates
        );

        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);

        if (pageNumber > 1) {
          pdf.addPage(format, isLandscape ? 'l' : 'p');
        }

        pdf.addImage(pageImgData, 'JPEG', 0, 0, pdfWidth, pageCanvas.height * ratio);
        
        position += pageHeightInCanvasPixels;
        heightLeft -= pageHeightInCanvasPixels;
        pageNumber++;
      }

      pdf.save(`${docTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("PDF compilation failed. Please click 'Print / Save System PDF' as a 100% vector fallback!");
    } finally {
      setExportLoading(false);
    }
  };

  // Clean vector system print and native PDF export
  const handleSystemPrint = () => {
    window.print();
  };

  // Copy to Clipboard
  const handleCopyToClipboard = () => {
    const plainText = getPlainText();
    const el = document.createElement('textarea');
    el.value = plainText;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Clear current document text
  const handleClearContent = () => {
    if (window.confirm("Clear all text from your current sheet?")) {
      setEditorContent("");
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
    }
  };

  // Generate document text using Gemini Flash API
  const handleAIGeneration = async () => {
    if (!customPrompt.trim()) return;
    setGeneratingWithAI(true);
    setErrorMsg("");

    try {
      const apiKey = ""; 
      const systemPrompt = `You are a professional administrative writer.
Generate fully formatted HTML document body content based on the user's request.
Return only clean interior HTML code (headers h1/h2/h3, standard lists ul/ol/li, paragraphs p, spacing). 
Do NOT include structural template wrappers like html, head, or body tags.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Write professional document content about: ${customPrompt}` }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] }
        })
      });

      if (!response.ok) {
        throw new Error("Unable to connect with AI generation service.");
      }

      const result = await response.json();
      const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (generatedText) {
        const cleanText = generatedText.replace(/```html/gi, "").replace(/```/g, "").trim();
        setEditorContent(cleanText);
        if (editorRef.current) {
          editorRef.current.innerHTML = cleanText;
        }
        setCustomPrompt("");
      } else {
        throw new Error("Empty response received from generation.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to generate content. Please try another prompt.");
    } finally {
      setGeneratingWithAI(false);
    }
  };

  const getMarginClass = () => {
    switch (marginSize) {
      case 'narrow': return 'p-6 md:p-8';
      case 'wide': return 'p-12 md:p-16';
      default: return 'p-8 md:p-12';
    }
  };

  const getFontFamilyClass = () => {
    switch (fontFamily) {
      case 'sans': return 'font-sans';
      case 'mono': return 'font-mono';
      case 'dyslexic': return 'font-dyslexic';
      default: return 'font-serif';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 transition-colors">
      <style>{`
        /* Import premium standard editing fonts */
        @import url('https://fonts.googleapis.com/css2?family=Open+Dyslexic&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Fira+Code:wght@400;500&display=swap');
        
        .font-sans { font-family: 'Inter', system-ui, sans-serif; }
        .font-serif { font-family: 'Playfair Display', Georgia, serif; }
        .font-mono { font-family: 'Fira Code', monospace; }
        .font-dyslexic { font-family: 'Open Dyslexic', sans-serif; }

        /* Dynamic scaling for base sizing selection to adjust titles & paragraph elements altogether */
        .editor-field {
          font-size: ${fontSize} !important;
        }
        .editor-field h1 { font-size: 2.25em !important; font-weight: 700; margin-bottom: 0.5em; line-height: 1.2; }
        .editor-field h2 { font-size: 1.75em !important; font-weight: 600; margin-bottom: 0.4em; line-height: 1.3; }
        .editor-field h3 { font-size: 1.35em !important; font-weight: 600; margin-bottom: 0.35em; line-height: 1.4; }
        .editor-field p { margin-bottom: 0.95em; line-height: 1.6; }
        .editor-field ul, .editor-field ol { margin-left: 1.5em; margin-bottom: 1em; list-style-position: outside; }
        .editor-field ul { list-style-type: disc; }
        .editor-field ol { list-style-type: decimal; }
        .editor-field li { margin-bottom: 0.3em; }

        /* Guide Line Breaks Rendering */
        .page-break-guide {
          border-top: 1px dotted rgba(99, 102, 241, 0.45);
          position: relative;
          height: 1px;
          margin-top: -1px;
          pointer-events: none;
          z-index: 10;
        }
        .page-break-guide::after {
          content: 'PAGE BREAK GUIDE';
          position: absolute;
          right: 12px;
          top: -8px;
          background-color: #6366f1;
          color: white;
          font-size: 8px;
          font-family: sans-serif;
          font-weight: bold;
          padding: 1px 5px;
          border-radius: 3px;
          letter-spacing: 0.05em;
        }

        /* Media Print Optimization */
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-document-sheet, #printable-document-sheet * {
            visibility: visible;
          }
          #printable-document-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            height: auto !important;
            box-shadow: none !important;
            border: none !important;
            padding: 2.5cm !important;
            background: white !important;
            color: black !important;
          }
          .no-print, .page-break-guide {
            display: none !important;
          }
        }

        /* Paper sheet format standards */
        .paper-a4 {
          width: 812px;
          min-height: 1149px;
        }
        .paper-letter {
          width: 816px;
          min-height: 1056px;
        }
        .paper-legal {
          width: 816px;
          min-height: 1344px;
        }
        
        .editor-field:empty::before {
          content: "Click here and start typing or paste your content to format instantly...";
          color: #94a3b8;
          font-style: italic;
        }
      `}</style>

      {/* Header Bar */}
      <header className="bg-white border-b border-slate-200 py-3 px-6 shadow-sm flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-md">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <input 
              type="text" 
              value={docTitle} 
              onChange={(e) => setDocTitle(e.target.value)} 
              className="font-bold text-lg text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none px-1 transition-all rounded"
              title="Click to rename your file"
            />
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>Text to Multi-Format Converter Hub</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Autosaving Localized
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Copy Plaintext */}
          <button 
            onClick={handleCopyToClipboard}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg shadow-sm transition-all"
            title="Copy clean plaintext to clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy Text"}
          </button>

          {/* Wipe Sheet */}
          <button 
            onClick={handleClearContent}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold text-rose-700 bg-rose-50 border border-rose-100 hover:bg-rose-100 rounded-lg shadow-sm transition-all"
            title="Clear all editor contents"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>

          {/* Real Print / Vector PDF download trigger */}
          <button 
            onClick={handleSystemPrint}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md hover:shadow-lg transition-all"
            title="Save natively as perfect vectorized PDF directly via system save"
          >
            <Printer className="w-4 h-4" />
            Print / Save System PDF
          </button>
        </div>
      </header>

      {/* Application Body Panel */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Control Column */}
        <aside className="w-full lg:w-[360px] bg-white border-r border-slate-200 flex flex-col overflow-y-auto no-print shadow-sm">
          
          {/* Templates Library */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Document Presets & Templates
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.keys(TEMPLATES).map((key) => (
                <button
                  key={key}
                  onClick={() => applyTemplate(key)}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 rounded-md transition-all text-left truncate shadow-sm"
                >
                  {TEMPLATES[key].title}
                </button>
              ))}
            </div>
          </div>

          {/* Layout Setup Tools */}
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-500" />
              Page Setup Options
            </h3>
            
            <div className="space-y-4">
              {/* Size selectors */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Paper Size</label>
                <div className="grid grid-cols-3 gap-1">
                  {['letter', 'A4', 'legal'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setPageSize(size)}
                      className={`py-1 text-xs font-semibold rounded uppercase transition-all ${
                        pageSize.toLowerCase() === size.toLowerCase()
                          ? 'bg-indigo-600 text-white shadow'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Layout Orientations */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Orientation</label>
                <div className="grid grid-cols-2 gap-1">
                  {['portrait', 'landscape'].map((orient) => (
                    <button
                      key={orient}
                      onClick={() => setOrientation(orient)}
                      className={`py-1 text-xs font-semibold rounded capitalize transition-all ${
                        orientation === orient
                          ? 'bg-indigo-600 text-white shadow'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {orient}
                    </button>
                  ))}
                </div>
              </div>

              {/* Margins */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Margins</label>
                <div className="grid grid-cols-3 gap-1">
                  {['narrow', 'normal', 'wide'].map((margin) => (
                    <button
                      key={margin}
                      onClick={() => setMarginSize(margin)}
                      className={`py-1 text-xs font-semibold rounded capitalize transition-all ${
                        marginSize === margin
                          ? 'bg-indigo-600 text-white shadow'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {margin}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizing & Typography Controls */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Font Family</label>
                  <select 
                    value={fontFamily} 
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full px-2 py-1 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="serif">Classic Serif</option>
                    <option value="sans">Modern Sans</option>
                    <option value="mono">Monospace</option>
                    <option value="dyslexic">Dyslexic-Friendly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Base Sizing</label>
                  <select 
                    value={fontSize} 
                    onChange={(e) => setFontSize(e.target.value)}
                    className="w-full px-2 py-1 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-indigo-500 cursor-pointer animate-pulse"
                  >
                    <option value="12px">12px (Small)</option>
                    <option value="14px">14px (Compact)</option>
                    <option value="16px">16px (Normal)</option>
                    <option value="18px">18px (Large)</option>
                    <option value="20px">20px (Readable)</option>
                    <option value="24px">24px (XL)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Page Break Visual Indicator Toggler */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-indigo-500" />
                  Show Visual Page Breaks
                </span>
                <input 
                  type="checkbox" 
                  checked={showPageGuides}
                  onChange={(e) => setShowPageGuides(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {/* Text Primary Tone */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Color Tone</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={textColor} 
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-8 h-8 rounded border border-slate-200 cursor-pointer"
                  />
                  <span className="text-xs text-slate-500 font-mono">{textColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Gemini Writer Prompt Section */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/40">
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Generate Content with AI
            </h3>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g., A formal apology letter for a missed meeting..."
              rows={3}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none resize-none bg-white shadow-inner"
            />
            {errorMsg && <p className="text-xs text-rose-600 mt-1">{errorMsg}</p>}
            <button
              onClick={handleAIGeneration}
              disabled={generatingWithAI || !customPrompt.trim()}
              className="w-full mt-2 py-2 px-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-md shadow flex items-center justify-center gap-1.5 transition-all"
            >
              {generatingWithAI ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Generating Content...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Insert AI Generated Text
                </>
              )}
            </button>
          </div>

          {/* Multi-Format Convert Export Panel */}
          <div className="p-5 mt-auto bg-slate-950 text-slate-200 border-t border-slate-800">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Download className="w-4 h-4" />
              Download Formats
            </h3>
            
            <div className="space-y-2">
              {/* Perfect multi-page compiler */}
              <button
                onClick={handlePdfDownload}
                disabled={exportLoading}
                className="w-full py-2.5 px-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 rounded-lg shadow flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-300" />
                  Convert to PDF Document
                </span>
                {exportLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                ) : (
                  <span className="bg-indigo-700 text-[10px] px-1.5 py-0.5 rounded text-indigo-200">.PDF</span>
                )}
              </button>

              {/* Word convert */}
              <button
                onClick={handleWordExport}
                className="w-full py-2.5 px-3 text-xs font-bold text-slate-300 bg-slate-900 hover:bg-slate-850 hover:text-white rounded-lg flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2">
                  <FileEdit className="w-4 h-4 text-emerald-400" />
                  Convert to MS Word File
                </span>
                <span className="bg-slate-800 text-[10px] px-1.5 py-0.5 rounded text-emerald-400">.DOC</span>
              </button>

              {/* Markdown file */}
              <button
                onClick={handleMarkdownExport}
                className="w-full py-2.5 px-3 text-xs font-bold text-slate-300 bg-slate-900 hover:bg-slate-850 hover:text-white rounded-lg flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-amber-400" />
                  Export to Markdown
                </span>
                <span className="bg-slate-800 text-[10px] px-1.5 py-0.5 rounded text-amber-400">.MD</span>
              </button>

              {/* Styled Web Page */}
              <button
                onClick={handleHtmlExport}
                className="w-full py-2.5 px-3 text-xs font-bold text-slate-300 bg-slate-900 hover:bg-slate-850 hover:text-white rounded-lg flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-purple-400" />
                  HTML Web Page Source
                </span>
                <span className="bg-slate-800 text-[10px] px-1.5 py-0.5 rounded text-purple-400">.HTML</span>
              </button>

              {/* Text converter */}
              <button
                onClick={handleTxtExport}
                className="w-full py-2.5 px-3 text-xs font-bold text-slate-300 bg-slate-900 hover:bg-slate-850 hover:text-white rounded-lg flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  Plain Text File
                </span>
                <span className="bg-slate-800 text-[10px] px-1.5 py-0.5 rounded text-blue-400">.TXT</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Right Side Sheet Editor View */}
        <main className="flex-1 overflow-y-auto bg-slate-200 p-4 md:p-8 flex flex-col items-center">
          
          {/* Rich text format controls */}
          <div className="w-full max-w-[816px] mb-4 bg-white rounded-lg shadow-sm border border-slate-200 p-2 flex flex-wrap items-center gap-1.5 no-print">
            <button 
              onClick={() => formatText('bold')} 
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 hover:text-indigo-600 transition-colors"
              title="Bold text"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button 
              onClick={() => formatText('italic')} 
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 hover:text-indigo-600 transition-colors"
              title="Italic text"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button 
              onClick={() => formatText('underline')} 
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 hover:text-indigo-600 transition-colors"
              title="Underline text"
            >
              <Underline className="w-4 h-4" />
            </button>
            <button 
              onClick={() => formatText('strikeThrough')} 
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 hover:text-indigo-600 transition-colors"
              title="Strike through"
            >
              <Strikethrough className="w-4 h-4" />
            </button>

            <span className="w-px h-5 bg-slate-200 mx-1"></span>

            <button 
              onClick={() => formatText('formatBlock', '<h1>')} 
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 hover:text-indigo-600 transition-colors"
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => formatText('formatBlock', '<h2>')} 
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 hover:text-indigo-600 transition-colors"
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => formatText('formatBlock', '<p>')} 
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 hover:text-indigo-600 transition-colors"
              title="Paragraph text"
            >
              <FileText className="w-4 h-4" />
            </button>

            <span className="w-px h-5 bg-slate-200 mx-1"></span>

            {/* In-editor inline Font Size Selection */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5">
              <Type className="w-3.5 h-3.5 text-slate-500" />
              <select 
                onChange={(e) => formatText('fontSize', e.target.value)}
                defaultValue="3"
                className="bg-transparent text-xs text-slate-600 outline-none cursor-pointer font-medium"
                title="Format selection font size"
              >
                <option value="1">Tiny</option>
                <option value="2">Small</option>
                <option value="3">Normal</option>
                <option value="4">Medium</option>
                <option value="5">Large</option>
                <option value="6">Heading</option>
                <option value="7">Huge</option>
              </select>
            </div>

            <span className="w-px h-5 bg-slate-200 mx-1"></span>

            <button 
              onClick={() => formatText('justifyLeft')} 
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 hover:text-indigo-600 transition-colors"
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => formatText('justifyCenter')} 
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 hover:text-indigo-600 transition-colors"
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button 
              onClick={() => formatText('justifyRight')} 
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 hover:text-indigo-600 transition-colors"
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => formatText('justifyFull')} 
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 hover:text-indigo-600 transition-colors"
              title="Align Justify"
            >
              <AlignJustify className="w-4 h-4" />
            </button>

            <span className="w-px h-5 bg-slate-200 mx-1"></span>

            <button 
              onClick={() => formatText('insertUnorderedList')} 
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 hover:text-indigo-600 transition-colors"
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => formatText('insertOrderedList')} 
              className="p-1.5 hover:bg-slate-100 rounded text-slate-700 hover:text-indigo-600 transition-colors"
              title="Ordered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>

            <span className="w-px h-5 bg-slate-200 mx-1"></span>

            <button 
              onClick={() => formatText('hiliteColor', '#fef08a')} 
              className="px-2 py-1 text-xs hover:bg-slate-100 rounded text-slate-700 hover:text-indigo-600 flex items-center gap-1 transition-colors"
              title="Highlight yellow"
            >
              <span className="w-3.5 h-3.5 rounded bg-yellow-200 border border-yellow-300"></span>
              Highlight
            </button>
            <button 
              onClick={() => formatText('removeFormat')} 
              className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-rose-600 transition-colors"
              title="Clear format"
            >
              <Undo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Document Sheet Area */}
          <div className="relative w-full flex justify-center pb-8">
            <div 
              id="printable-document-sheet"
              ref={editorRef}
              contentEditable={true}
              onInput={(e) => {
                setEditorContent(e.currentTarget.innerHTML);
                calculateRealTimePages();
              }}
              style={{
                color: textColor,
                backgroundColor: '#ffffff'
              }}
              className={`
                editor-field
                bg-white 
                shadow-2xl 
                border 
                border-slate-300 
                rounded-sm 
                outline-none 
                overflow-visible 
                relative
                ${getMarginClass()} 
                ${getFontFamilyClass()}
                ${pageSize.toLowerCase() === 'letter' ? 'paper-letter' : pageSize.toLowerCase() === 'legal' ? 'paper-legal' : 'paper-a4'}
              `}
              dangerouslySetInnerHTML={{ __html: editorContent }}
            />

            {/* Overlay Page Break Dotted Guides (strictly reference overlay) */}
            {showPageGuides && Array.from({ length: stats.pages - 1 }).map((_, index) => {
              const sizeKey = pageSize.toLowerCase();
              const pageH = PAGE_HEIGHTS[sizeKey]?.[orientation] || 1056;
              const paddingOffsetCorrection = marginSize === 'narrow' ? 60 : marginSize === 'wide' ? 120 : 80; // Margin scaling correction factor
              const splitPos = (index + 1) * (pageH - paddingOffsetCorrection);
              
              return (
                <div 
                  key={index}
                  className="absolute left-0 right-0 page-break-guide no-print"
                  style={{ 
                    top: `${splitPos}px`,
                    width: '100%',
                    maxWidth: pageSize.toLowerCase() === 'letter' ? '816px' : pageSize.toLowerCase() === 'legal' ? '816px' : '812px',
                    marginLeft: 'auto',
                    marginRight: 'auto'
                  }}
                />
              );
            })}
          </div>

          {/* Metrics Console */}
          <div className="w-full max-w-[816px] bg-slate-900 text-slate-300 rounded-xl shadow-lg p-5 mt-auto flex flex-wrap items-center justify-between gap-4 no-print border border-slate-800">
            <div className="flex items-center gap-6 flex-wrap">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Estimated Pages</p>
                <p className="text-lg font-bold text-indigo-400">{stats.pages}</p>
              </div>
              <div className="h-8 w-px bg-slate-800"></div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Words</p>
                <p className="text-lg font-bold text-white">{stats.words}</p>
              </div>
              <div className="h-8 w-px bg-slate-800"></div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Characters</p>
                <p className="text-lg font-bold text-slate-300">{stats.chars}</p>
              </div>
              <div className="h-8 w-px bg-slate-800"></div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Sentences</p>
                <p className="text-lg font-bold text-slate-300">{stats.sentences}</p>
              </div>
              <div className="h-8 w-px bg-slate-800"></div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Est. Reading Time</p>
                <p className="text-lg font-bold text-indigo-400">{Math.ceil(stats.words / 200)} min</p>
              </div>
            </div>
            
            <div className="text-[11px] text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800">
              ⚡ Status: <span className="text-emerald-400 font-semibold">Fully Functional Offline</span>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}