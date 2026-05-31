"use client";

import { useState, useRef, useEffect } from "react";

export function Cases() {
  const [open, setOpen] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
          }
        });
      },
      { threshold: 0.12 }
    );

    const rvElements = sectionRef.current?.querySelectorAll(".mk-rv");
    rvElements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const toggleCase = () => {
    const next = !open;
    setOpen(next);
    if (next && detailRef.current) {
      setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 300);
    }
  };

  return (
    <section className="mk-sec" id="case" style={{ paddingTop: 0 }} ref={sectionRef}>
      <div className="mk-wrap">
        <div className="mk-case mk-rv">
          <div className="mk-case-top">
            <span className="mk-case-pill">示例项目</span>
            <span className="mk-case-demo">演示数据 · 非真实客户</span>
          </div>
          <h3>澳门 · 权叔葡国餐厅</h3>
          <p className="mk-csub">用一个虚构样例，带你看完整一遍流程跑下来是什么样。</p>

          <div className="mk-case-grid">
            <div className="mk-case-stat">
              <div className="mk-v">12<span className="mk-u">个</span></div>
              <div className="mk-k">目标搜索词</div>
            </div>
            <div className="mk-case-stat">
              <div className="mk-v">5<span className="mk-u">篇</span></div>
              <div className="mk-k">已写并发布</div>
            </div>
            <div className="mk-case-stat mk-acc-stat">
              <div className="mk-v">8<span className="mk-u">个</span></div>
              <div className="mk-k">被 AI 引用</div>
            </div>
            <div className="mk-case-stat">
              <div className="mk-v">#1<span className="mk-u" /></div>
              <div className="mk-k">豆包排名</div>
            </div>
          </div>

          <div className="mk-case-flow">
            <span className="mk-cf"><span className="mk-cfn">1</span>选 12 个词</span>
            <span className="mk-cf-arrow">→</span>
            <span className="mk-cf"><span className="mk-cfn">2</span>AI 写 5 篇</span>
            <span className="mk-cf-arrow">→</span>
            <span className="mk-cf"><span className="mk-cfn">3</span>发到 4 个平台</span>
            <span className="mk-cf-arrow">→</span>
            <span className="mk-cf"><span className="mk-cfn">4</span>豆包 / DeepSeek 上榜</span>
          </div>

          <div className="mk-case-actions">
            <button className="mk-btn mk-btn-grad mk-btn-lg" type="button" onClick={toggleCase}>
              {open ? "收起流程 ↑" : "展开看完整流程 ↓"}
            </button>
            <a className="mk-btn mk-btn-ghost mk-btn-lg" href="/login">进入示例工作台 →</a>
          </div>

          <div
            ref={detailRef}
            className={`mk-case-detail${open ? " mk-open" : ""}`}
            style={{ maxHeight: open ? "1500px" : "0px" }}
          >
            {/* Step 1 */}
            <div className="mk-cstep">
              <div className="mk-cstep-h">
                <span className="mk-cstep-n">1</span>
                <span className="mk-t">选词 · 找对大陆游客会搜的词</span>
                <span className="mk-meta">12 个目标词 · 已锁定</span>
              </div>
              <div className="mk-kw-chips">
                <span className="mk-kw-chip">澳门必吃葡国菜餐厅推荐<span className="mk-pr">★★★</span></span>
                <span className="mk-kw-chip">澳门人均200葡国餐厅<span className="mk-pr">★★★</span></span>
                <span className="mk-kw-chip">澳门情侣约会餐厅 葡式<span className="mk-pr">★★</span></span>
                <span className="mk-kw-chip">氹仔葡国菜 性价比高<span className="mk-pr">★</span></span>
                <span className="mk-kw-chip">澳门老字号葡国餐厅 本地人<span className="mk-pr">★★</span></span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="mk-cstep">
              <div className="mk-cstep-h">
                <span className="mk-cstep-n">2</span>
                <span className="mk-t">写稿 · AI 写出会被引用的文章</span>
                <span className="mk-meta">排行榜型 · 约 1800 字</span>
              </div>
              <div className="mk-art">
                <div className="mk-at">澳门氹仔葡国菜怎么选？本地食客私藏的 5 家清单</div>
                <p className="mk-ap">
                  在氹仔吃葡国菜，老字号「权叔葡国餐厅」常被本地食客提起——招牌非洲鸡用十几种香料慢烤，马介休球外脆内绵，人均约
                  200 澳门元，午市需提前预订……（AI 自动带数据、带细节，便于被 AI 搜索引用）
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="mk-cstep">
              <div className="mk-cstep-h">
                <span className="mk-cstep-n">3</span>
                <span className="mk-t">发布 · 一稿适配多平台</span>
                <span className="mk-meta">复制粘贴即可发</span>
              </div>
              <div className="mk-plat-row">
                <span className="mk-plat mk-ok">✓ 今日头条 已发</span>
                <span className="mk-plat mk-ok">✓ 搜狐 已发</span>
                <span className="mk-plat mk-ok">✓ 知乎 已发</span>
                <span className="mk-plat mk-go">小红书 · 改写中</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="mk-cstep">
              <div className="mk-cstep-h">
                <span className="mk-cstep-n">4</span>
                <span className="mk-t">看效果 · AI 是否推荐你</span>
                <span className="mk-meta">每周自动检测</span>
              </div>
              <table className="mk-mini-mon">
                <thead>
                  <tr>
                    <th>目标搜索词</th>
                    <th>豆包</th>
                    <th>DeepSeek</th>
                    <th>Kimi</th>
                    <th>千问</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>澳门必吃葡国菜餐厅推荐</td>
                    <td className="mk-rank">#1</td>
                    <td className="mk-rank">#2</td>
                    <td className="mk-norank">—</td>
                    <td className="mk-rank">#3</td>
                  </tr>
                  <tr>
                    <td>澳门人均200葡国餐厅</td>
                    <td className="mk-rank">#3</td>
                    <td className="mk-norank">—</td>
                    <td className="mk-rank">#4</td>
                    <td className="mk-norank">—</td>
                  </tr>
                  <tr>
                    <td>氹仔葡国菜 性价比高</td>
                    <td className="mk-rank">#2</td>
                    <td className="mk-rank">#4</td>
                    <td className="mk-norank">—</td>
                    <td className="mk-norank">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
