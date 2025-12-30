
import { jsPDF } from "jspdf";
import { JournalEntry, UserProfile } from "../types";

export const generateJournalPDF = (user: UserProfile, entries: JournalEntry[]) => {
  const doc = new jsPDF();
  
  // -- Styling Constants --
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let y = margin;

  // -- Helper: Add Page & Reset Y --
  const checkPageBreak = (heightNeeded: number) => {
    if (y + heightNeeded > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // -- Title Page --
  doc.setFont("times", "bold");
  doc.setFontSize(28);
  doc.text("The Journal", pageWidth / 2, pageHeight / 3, { align: "center" });
  
  doc.setFontSize(16);
  doc.setFont("times", "normal");
  doc.text(`of`, pageWidth / 2, (pageHeight / 3) + 15, { align: "center" });
  
  doc.setFontSize(32);
  doc.setFont("times", "bold");
  doc.text(user.name, pageWidth / 2, (pageHeight / 3) + 35, { align: "center" });
  
  doc.setFontSize(12);
  doc.setFont("times", "italic");
  doc.text(`${entries.length} Memories inside`, pageWidth / 2, (pageHeight / 3) + 50, { align: "center" });

  doc.addPage();
  y = margin;

  // -- Entries --
  // Sort chronologically for reading flow (oldest first)
  const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  sortedEntries.forEach((entry, index) => {
    const dateStr = new Date(entry.date).toLocaleDateString(undefined, {
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
    
    // Header (Date)
    checkPageBreak(20);
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.text(dateStr, margin, y);
    y += 7;

    // Subheader (Meta)
    checkPageBreak(10);
    doc.setFont("times", "italic");
    doc.setFontSize(10);
    doc.setTextColor(100);
    const metaText = `${entry.mood} | ${entry.location || 'Unknown Location'}`;
    doc.text(metaText, margin, y);
    doc.setTextColor(0);
    y += 10;

    // Entry Title
    checkPageBreak(10);
    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.text(entry.title.toUpperCase(), margin, y);
    y += 8;

    // Content
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    
    const lines = doc.splitTextToSize(entry.content, contentWidth);
    
    // Print lines handling page breaks
    lines.forEach((line: string) => {
      checkPageBreak(6);
      doc.text(line, margin, y);
      y += 6;
    });

    y += 10; // Spacing after entry

    // Separator (only if not last and enough space)
    if (index < sortedEntries.length - 1) {
       checkPageBreak(15);
       doc.setDrawColor(200);
       doc.line(margin + 50, y, pageWidth - margin - 50, y);
       y += 15;
    }
  });

  // Footer on pages? (Simplification: No specific footer for now, standard Diary style)
  
  const fileName = `Journal_${user.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
