#!/usr/bin/env python3
"""Build both full CV PDFs from the same bilingual data used by the website."""
from pathlib import Path
import json
from xml.sax.saxutils import escape
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle,
    KeepTogether, HRFlowable, CondPageBreak, PageBreak,
)

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "src/data/cv.json").read_text(encoding="utf-8"))
OUT = ROOT / "generated-pdfs"
OUT.mkdir(parents=True, exist_ok=True)


def resolve_font(*names: str) -> Path:
    """Find a Unicode-capable TTF on Linux, macOS or Windows (DejaVu preferred)."""
    directories = [
        Path("/usr/share/fonts/truetype/dejavu"),
        Path("/usr/share/fonts/dejavu"),
        Path("/usr/share/fonts/truetype"),
        Path("/usr/share/fonts"),
        Path("C:/Windows/Fonts"),
        Path("/Library/Fonts"),
        Path.home() / "Library/Fonts",
    ]
    for directory in directories:
        for name in names:
            candidate = directory / name
            if candidate.exists():
                return candidate
    raise SystemExit(f"No se encontró ninguna fuente de entre: {', '.join(names)}")


REGULAR = resolve_font("DejaVuSans.ttf", "arial.ttf", "segoeui.ttf", "Helvetica.ttc")
BOLD = resolve_font("DejaVuSans-Bold.ttf", "arialbd.ttf", "segoeuib.ttf", "Helvetica.ttc")
print(f"Usando fuentes: {REGULAR} · {BOLD}")
pdfmetrics.registerFont(TTFont("Portfolio", str(REGULAR)))
pdfmetrics.registerFont(TTFont("Portfolio-Bold", str(BOLD)))
INK = colors.HexColor("#173b3b")
ACCENT = colors.HexColor("#17866e")
MUTED = colors.HexColor("#566662")
PALE = colors.HexColor("#edf3ef")
LINE = colors.HexColor("#d9e1dc")


def build(lang: str) -> None:
    d = DATA[lang]
    filename = "Leonardo-Colas-Leyva-CV-ES.pdf" if lang == "es" else "Leonardo-Colas-Leyva-CV-EN.pdf"
    out = OUT / filename
    page_w, page_h = A4
    left = right = 18 * mm
    top = 17 * mm
    bottom = 18 * mm
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="CVName", fontName="Portfolio-Bold", fontSize=25, leading=30, textColor=INK, spaceAfter=3))
    styles.add(ParagraphStyle(name="CVTitle", fontName="Portfolio", fontSize=9.3, leading=14, textColor=ACCENT, spaceAfter=6))
    styles.add(ParagraphStyle(name="Contact", fontName="Portfolio", fontSize=7.7, leading=12, textColor=MUTED))
    styles.add(ParagraphStyle(name="Section", fontName="Portfolio-Bold", fontSize=11, leading=15, textColor=INK, spaceBefore=12, spaceAfter=5, keepWithNext=True))
    styles.add(ParagraphStyle(name="BodyCV", fontName="Portfolio", fontSize=8.2, leading=12.3, textColor=INK, spaceAfter=3))
    styles.add(ParagraphStyle(name="SmallCV", fontName="Portfolio", fontSize=7.4, leading=10.8, textColor=MUTED))
    styles.add(ParagraphStyle(name="ItemCV", fontName="Portfolio-Bold", fontSize=8.7, leading=12, textColor=INK))
    styles.add(ParagraphStyle(name="RightCV", fontName="Portfolio", fontSize=7.3, leading=10, textColor=ACCENT, alignment=TA_RIGHT))
    styles.add(ParagraphStyle(name="SkillHead", fontName="Portfolio-Bold", fontSize=7.5, leading=10, textColor=INK))
    styles.add(ParagraphStyle(name="SkillBody", fontName="Portfolio", fontSize=7.2, leading=10.2, textColor=MUTED))

    def footer(canvas, doc):
        canvas.saveState()
        canvas.setStrokeColor(LINE)
        canvas.setLineWidth(.5)
        canvas.line(left, 12 * mm, page_w - right, 12 * mm)
        canvas.setFont("Portfolio", 7)
        canvas.setFillColor(MUTED)
        canvas.drawString(left, 8 * mm, "Leonardo Colás Leyva · leonardocolasleyva@gmail.com")
        canvas.drawRightString(page_w - right, 8 * mm, f"{doc.page}")
        canvas.restoreState()

    doc = BaseDocTemplate(str(out), pagesize=A4, leftMargin=left, rightMargin=right, topMargin=top, bottomMargin=bottom, title=f"{d['name']} — CV", author=d['name'], subject=d['title'], pageCompression=1)
    frame = Frame(left, bottom, page_w-left-right, page_h-top-bottom, id="main", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates([PageTemplate(id="cv", frames=[frame], onPage=footer)])
    story = []
    story += [Paragraph(escape(d["name"]), styles["CVName"]), Paragraph(escape(d["title"]), styles["CVTitle"])]
    contact = "leonardocolasleyva@gmail.com  ·  +53 5 6083226  ·  github.com/leonardocolas  ·  " + d["location"]
    story += [Paragraph(escape(contact), styles["Contact"]), Spacer(1, 8), HRFlowable(width="100%", thickness=1.4, color=ACCENT, spaceAfter=4)]

    def section(title):
        story.append(Paragraph(escape(title), styles["Section"]))
        story.append(HRFlowable(width="100%", thickness=.55, color=LINE, spaceAfter=5))

    section(d["profileTitle"])
    story.append(Paragraph(escape(d["profile"]), styles["BodyCV"]))

    section(d["experienceTitle"])
    for job in d["experience"]:
        head = Table([[Paragraph(escape(job["role"] + " · " + job["company"]), styles["ItemCV"]), Paragraph(escape(job["period"]), styles["RightCV"])], [Paragraph(escape(job["location"]), styles["SmallCV"]), ""]], colWidths=[doc.width * .73, doc.width * .27])
        head.setStyle(TableStyle([("VALIGN", (0,0),(-1,-1),"TOP"),("ALIGN",(1,0),(1,-1),"RIGHT"),("LEFTPADDING",(0,0),(-1,-1),0),("RIGHTPADDING",(0,0),(-1,-1),0),("TOPPADDING",(0,0),(-1,-1),0),("BOTTOMPADDING",(0,0),(-1,-1),1)]))
        rows = [head]
        for bullet in job["bullets"]:
            rows.append(Paragraph("•  " + escape(bullet), styles["BodyCV"]))
        story.append(KeepTogether(rows))
        story.append(Spacer(1, 4))

    story.append(PageBreak())
    section(d["projectsTitle"])
    for project in d["projects"]:
        block = [Paragraph(escape(project["name"] + "  ·  " + project["type"]), styles["ItemCV"]), Paragraph(escape(" · ".join(project["stack"])), styles["SmallCV"]), Paragraph(escape(project["description"]), styles["BodyCV"]), Spacer(1, 3)]
        story.append(KeepTogether(block))

    section(d["skillsTitle"])
    group_labels = [d["professionalSkillsTitle"], d["additionalSkillsTitle"]]
    for label, group_slice in [(group_labels[0], d["skillGroups"][:4]), (group_labels[1], d["skillGroups"][4:])]:
        story.append(Paragraph(escape(label), styles["SkillHead"]))
        for g in group_slice:
            story.append(Paragraph(f"<b>{escape(g['title'])}:</b> {escape(', '.join(g['items']))}", styles["BodyCV"]))
        story.append(Spacer(1, 3))
    story.append(Paragraph(escape(d["softwareSkillsTitle"]), styles["SkillHead"]))
    for item in d["softwareSkills"]:
        story.append(Paragraph(f"<b>{escape(item['title'])}:</b> {escape(item['description'])}", styles["BodyCV"]))

    section(d["educationTitle"])
    story.append(Paragraph(f"<b>{escape(d['degree'])}</b> · {escape(d['university'])} · {escape(d['location'])}", styles["BodyCV"]))
    story.append(Paragraph(escape(d["goldTitle"]), styles["BodyCV"]))
    story.append(Paragraph(f"<b>{escape(d['awardsLabel'])}:</b> {escape('; '.join(d['awards']))}.", styles["BodyCV"]))
    section(d["languagesTitle"])
    story.append(Paragraph("  ·  ".join(f"<b>{escape(x['name'])}:</b> {escape(x['level'])}" for x in d["languages"]), styles["BodyCV"]))
    doc.build(story)
    print(f"{out} ({out.stat().st_size:,} bytes)")


if __name__ == "__main__":
    build("es")
    build("en")
