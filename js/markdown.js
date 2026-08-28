export function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

export function renderMarkdown(source) {
    let html = escapeHtml(source);

    html = html.replace(
        /```([\s\S]*?)```/g,
        "<pre><code>$1</code></pre>"
    );

    html = html.replace(
        /`([^`\n]+)`/g,
        "<code>$1</code>"
    );

    html = html.replace(
        /\*\*([^*]+)\*\*/g,
        "<strong>$1</strong>"
    );

    html = html.replace(
        /~~([^~]+)~~/g,
        "<del>$1</del>"
    );

    html = html.replace(
        /^\s*&gt;\s?(.*)$/gm,
        "<blockquote>$1</blockquote>"
    );

    html = html.replace(
        /^\s*-\s+(.*)$/gm,
        "• $1"
    );

    html = html.replace(
        /\n/g,
        "<br>"
    );

    return html;
}
