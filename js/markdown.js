export function escapeHtml(value=""){
  return value.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#039;");
}
export function markdown(value=""){
  let s=escapeHtml(value);
  s=s.replace(/```([\s\S]*?)```/g,"<pre><code>$1</code></pre>");
  s=s.replace(/`([^`]+)`/g,"<code>$1</code>");
  s=s.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>");
  s=s.replace(/__([^_]+)__/g,"<strong>$1</strong>");
  s=s.replace(/\*([^*]+)\*/g,"<em>$1</em>");
  s=s.replace(/_([^_]+)_/g,"<em>$1</em>");
  s=s.replace(/~~([^~]+)~~/g,"<del>$1</del>");
  s=s.replace(/^&gt; (.*)$/gm,"<blockquote>$1</blockquote>");
  s=s.replace(/^\s*-\s+(.*)$/gm,"• $1");
  s=s.replace(/\n/g,"<br>");
  return s;
}
