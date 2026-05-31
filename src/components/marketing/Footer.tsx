export function Footer() {
  return (
    <footer className="mk-footer">
      <div className="mk-wrap">
        <a className="mk-logo mk-lg" href="#top" style={{ justifyContent: "center" }}>
          <span className="mk-logo-mark">@</span>
          <span className="mk-logo-word">
            <span className="mk-ai">AI</span>提名官
          </span>
        </a>
        <p className="mk-fnote">
          让 AI 搜索主动推荐你的品牌 · 港澳商家 &amp; 个人 IP 的 GEO 自动化平台
        </p>
        <div className="mk-flink">
          <a href="#how">怎么用</a>
          <a href="#power">核心能力</a>
          <a href="#case">示例项目</a>
          <a href="#">联系我们</a>
        </div>
        <p className="mk-fnote">&copy; 2026 AI提名官 · 上线测试期</p>
      </div>
    </footer>
  );
}
