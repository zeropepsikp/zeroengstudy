// 아주 가벼운 마크다운 → HTML 변환기 (외부 의존성 없음).
// 제목, 굵게/기울임, 목록, 표, 코드, 인용, 구분선, 링크 지원.

function esc(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inline(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*(?!\s)([^*]+?)\*/g, "$1<em>$2</em>")
    .replace(/`([^`]+?)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

export function renderMarkdown(md) {
  if (!md) return "";
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let i = 0;

  const flushList = (buf, ordered) => {
    if (!buf.length) return;
    out.push(`<${ordered ? "ol" : "ul"}>`);
    buf.forEach((t) => out.push(`<li>${inline(t)}</li>`));
    out.push(`</${ordered ? "ol" : "ul"}>`);
    buf.length = 0;
  };

  while (i < lines.length) {
    let line = lines[i];

    // 코드 블록
    if (/^```/.test(line)) {
      const code = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) code.push(lines[i++]);
      i++;
      out.push(`<pre><code>${esc(code.join("\n"))}</code></pre>`);
      continue;
    }

    // 표
    if (/^\s*\|.*\|\s*$/.test(line) && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1] || "")) {
      const header = line.split("|").slice(1, -1).map((c) => c.trim());
      i += 2;
      const rows = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
        rows.push(lines[i].split("|").slice(1, -1).map((c) => c.trim()));
        i++;
      }
      let t = '<div class="table-wrap"><table><thead><tr>';
      header.forEach((h) => (t += `<th>${inline(h)}</th>`));
      t += "</tr></thead><tbody>";
      rows.forEach((r) => {
        t += "<tr>";
        header.forEach((_, idx) => (t += `<td>${inline(r[idx] || "")}</td>`));
        t += "</tr>";
      });
      t += "</tbody></table></div>";
      out.push(t);
      continue;
    }

    // 제목
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`);
      i++;
      continue;
    }

    // 구분선
    if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
      out.push("<hr>");
      i++;
      continue;
    }

    // 인용
    if (/^\s*>\s?/.test(line)) {
      const q = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        q.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      out.push(`<blockquote>${inline(q.join(" "))}</blockquote>`);
      continue;
    }

    // 순서 있는 목록
    if (/^\s*\d+\.\s+/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      flushList(buf, true);
      continue;
    }

    // 순서 없는 목록
    if (/^\s*[-*+]\s+/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*[-*+]\s+/, ""));
        i++;
      }
      flushList(buf, false);
      continue;
    }

    // 빈 줄
    if (/^\s*$/.test(line)) {
      i++;
      continue;
    }

    // 문단
    const para = [];
    while (i < lines.length && !/^\s*$/.test(lines[i]) &&
      !/^\s*(#{1,6}\s|[-*+]\s|\d+\.\s|>|```|\|)/.test(lines[i])) {
      para.push(lines[i]);
      i++;
    }
    out.push(`<p>${inline(para.join(" "))}</p>`);
  }

  return out.join("\n");
}
