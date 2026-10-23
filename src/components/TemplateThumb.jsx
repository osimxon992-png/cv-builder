// A schematic "paper sheet" that mirrors each template's real layout.
const Lines = ({ n }) => Array.from({ length: n }, (_, i) => <i key={i} />);
const SIDE_LAYOUTS = ['sidebar-left', 'sidebar-right', 'two-col', 'topbar-side', 'bars'];

export default function TemplateThumb({ template }) {
  const { layout, accent, photo } = template;
  return (
    <div className={`sheet thumb-${layout}`} style={{ '--tpl': accent }} aria-hidden="true">
      <div className="t-head">
        {photo && <span className="t-photo" />}
        <span className="t-name" />
      </div>
      {SIDE_LAYOUTS.includes(layout) && (
        <div className="t-side">
          <Lines n={7} />
        </div>
      )}
      <div className="t-body">
        {[0, 1, 2].map((block) => (
          <div className="t-block" key={block}>
            <b />
            <Lines n={3} />
          </div>
        ))}
      </div>
    </div>
  );
}
