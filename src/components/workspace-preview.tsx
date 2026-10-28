export function WorkspacePreview() {
  return (
    <div
      className="workspace-preview"
      aria-label="Illustrative dashboard preview"
    >
      <div className="workspace-preview-top">
        <div className="workspace-preview-brand">
          <span>₹</span> Rags to Riches
        </div>
        <div className="workspace-preview-avatar">ST</div>
      </div>
      <div className="workspace-preview-body">
        <div className="workspace-preview-heading">
          <div>
            <span className="workspace-preview-overline">
              YOUR MONEY AT A GLANCE
            </span>
            <h3>Good morning, student</h3>
          </div>
          <span className="workspace-preview-month">October</span>
        </div>
        <div className="workspace-preview-stats">
          <div className="workspace-preview-stat workspace-preview-balance">
            <span>Available to spend</span>
            <strong>₹3,450</strong>
            <small>After ₹2,000 in goals</small>
          </div>
          <div className="workspace-preview-stat">
            <span>Income</span>
            <strong>₹6,800</strong>
            <small>Pocket money + work</small>
          </div>
          <div className="workspace-preview-stat">
            <span>Expenses</span>
            <strong>₹1,350</strong>
            <small>Across 3 categories</small>
          </div>
        </div>
        <div className="workspace-preview-lower">
          <div className="workspace-preview-chart">
            <div className="workspace-preview-card-heading">
              <strong>Where money stands</strong>
              <span>Overview</span>
            </div>
            <div className="workspace-preview-bars" aria-hidden="true">
              <div>
                <i style={{ height: "82%" }} />
                <span>Received</span>
              </div>
              <div>
                <i style={{ height: "16%" }} />
                <span>Spent</span>
              </div>
              <div>
                <i style={{ height: "24%" }} />
                <span>Goals</span>
              </div>
              <div>
                <i style={{ height: "42%" }} />
                <span>Free</span>
              </div>
            </div>
          </div>
          <div className="workspace-preview-goal">
            <div className="workspace-preview-card-heading">
              <strong>New laptop</strong>
              <span>Goal</span>
            </div>
            <strong>
              ₹2,000 <small>of ₹30,000</small>
            </strong>
            <div className="workspace-preview-track">
              <i />
            </div>
            <span>7% saved</span>
          </div>
        </div>
      </div>
    </div>
  );
}
