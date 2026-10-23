// Building blocks shared by all PDF templates. Templates decide layout and styles;
// these functions decide what content each CV section produces.
import { Image, Link, Text, View } from '@react-pdf/renderer';
import { filledEntries, isSectionVisible } from '../lib/cvModel.js';

export function makeStyles({ font = 'NotoSans', headingFont = font, accent, text = '#1f2937', muted = '#6b7280', size = 10 }, overrides = {}) {
  const base = {
    page: { fontFamily: font, fontSize: size, color: text, paddingTop: 36, paddingBottom: 44, paddingHorizontal: 42, lineHeight: 1.4 },
    section: { marginBottom: 12 },
    heading: { fontFamily: headingFont, fontWeight: 700, fontSize: size + 2, color: accent, marginBottom: 6 },
    entry: { marginBottom: 8 },
    entryHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
    entryTitle: { fontWeight: 700 },
    entrySub: { color: muted },
    entryDate: { color: muted, fontSize: size - 1, marginLeft: 8 },
    body: { marginTop: 1 },
    bulletRow: { flexDirection: 'row', marginTop: 1 },
    bulletDot: { width: 10 },
    bulletText: { flex: 1 },
    link: { color: accent, textDecoration: 'none', fontSize: size - 1 },
    linkRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 2 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
    chip: { paddingVertical: 2, paddingHorizontal: 6, borderRadius: 3, backgroundColor: '#f1f5f9', fontSize: size - 1 },
    subLabel: { fontWeight: 700, fontSize: size - 1, color: muted, marginBottom: 3, marginTop: 2 },
    listItem: { marginBottom: 2 },
    strong: { fontWeight: 700 },
    muted: { color: muted },
    pageNumber: { position: 'absolute', bottom: 18, right: 42, fontSize: 8, color: muted },
  };
  for (const [key, style] of Object.entries(overrides)) base[key] = { ...base[key], ...style };
  return base;
}

const fmtDate = (d) => (/^\d{4}-\d{2}$/.test(d) ? `${d.slice(5, 7)}/${d.slice(0, 4)}` : d);

export function dateRange(entry, L) {
  const end = entry.current ? L.present : fmtDate(entry.endDate);
  return [fmtDate(entry.startDate), end].filter(Boolean).join(' – ');
}

const join = (parts, sep) => parts.map((p) => p?.trim()).filter(Boolean).join(sep);
const href = (url) => (/^[a-z][a-z\d+.-]*:\/\//i.test(url) ? url : `https://${url}`);
export const displayUrl = (url) => url.trim().replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');

/** Contact lines for headers/sidebars: [{ key, text, href? }] */
export function contactItems(p) {
  return [
    p.email.trim() && { key: 'email', text: p.email.trim(), href: `mailto:${p.email.trim()}` },
    p.phone.trim() && { key: 'phone', text: p.phone.trim() },
    join([p.city, p.country], ', ') && { key: 'location', text: join([p.city, p.country], ', ') },
    p.linkedin.trim() && { key: 'linkedin', text: displayUrl(p.linkedin), href: href(p.linkedin.trim()) },
    p.website.trim() && { key: 'website', text: displayUrl(p.website), href: href(p.website.trim()) },
  ].filter(Boolean);
}

export function ContactText({ item, s, style }) {
  return item.href ? (
    <Link src={item.href} style={[s.link, style]}>{item.text}</Link>
  ) : (
    <Text style={style}>{item.text}</Text>
  );
}

export const Photo = ({ cv, style }) => (cv.personal.photo ? <Image src={cv.personal.photo} style={style} /> : null);

export function RichText({ text, s }) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return null;
  return (
    <View>
      {lines.map((line, i) =>
        /^[-•*–]\s*/.test(line) ? (
          <View key={i} style={s.bulletRow} wrap={false}>
            <Text style={s.bulletDot}>•</Text>
            <Text style={s.bulletText}>{line.replace(/^[-•*–]\s*/, '')}</Text>
          </View>
        ) : (
          <Text key={i} style={s.body}>{line}</Text>
        ),
      )}
    </View>
  );
}

function Entry({ s, title, subtitle, date, children }) {
  return (
    <View style={s.entry}>
      {s.entryDot && <View style={s.entryDot} />}
      {/* keep title + date together so they never split across pages */}
      <View style={s.entryHead} wrap={false}>
        <View style={{ flexGrow: 1, flexShrink: 1 }}>
          {title ? <Text style={s.entryTitle}>{title}</Text> : null}
          {subtitle ? <Text style={s.entrySub}>{subtitle}</Text> : null}
        </View>
        {date ? <Text style={s.entryDate}>{date}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function Tags({ items, s, mode }) {
  if (mode === 'chips') {
    return (
      <View style={s.chipRow}>
        {items.map((name, i) => <Text key={i} style={s.chip}>{name}</Text>)}
      </View>
    );
  }
  if (mode === 'list') return items.map((name, i) => <Text key={i} style={s.listItem}>• {name}</Text>);
  return <Text>{items.join(' · ')}</Text>;
}

const ENTRY_SECTIONS = {
  experience: (e, L) => ({ title: e.position, subtitle: join([e.company, e.location], ' · '), date: dateRange(e, L), text: e.description }),
  education: (e, L) => ({ title: join([e.degree, e.field], ', '), subtitle: e.institution, date: dateRange(e, L), text: e.details }),
  certifications: (e) => ({ title: e.title, subtitle: e.issuer, date: fmtDate(e.date) }),
  courses: (e) => ({ title: e.title, subtitle: e.provider, date: fmtDate(e.date) }),
  volunteer: (e, L) => ({ title: e.role, subtitle: e.organization, date: dateRange(e, L), text: e.description }),
  awards: (e) => ({ title: e.title, subtitle: e.issuer, date: fmtDate(e.date), text: e.description }),
};

function sectionBody(key, cv, L, s, opts) {
  const entries = key === 'summary' ? [] : filledEntries(cv, key);
  if (key === 'summary') return <RichText text={cv.summary} s={s} />;
  if (ENTRY_SECTIONS[key]) {
    return entries.map((e) => {
      const { text, ...head } = ENTRY_SECTIONS[key](e, L);
      return (
        <Entry key={e.id} s={s} {...head}>
          {text ? <RichText text={text} s={s} /> : null}
        </Entry>
      );
    });
  }
  if (key === 'projects') {
    return entries.map((e) => (
      <Entry key={e.id} s={s} title={e.name} subtitle={e.technologies.trim() ? `${L.technologies}: ${e.technologies.trim()}` : ''}>
        <RichText text={e.description} s={s} />
        {(e.url.trim() || e.repo.trim()) && (
          <View style={s.linkRow}>
            {e.url.trim() ? <Link src={href(e.url.trim())} style={s.link}>{displayUrl(e.url)}</Link> : null}
            {e.repo.trim() ? <Link src={href(e.repo.trim())} style={s.link}>{`${L.repository}: ${displayUrl(e.repo)}`}</Link> : null}
          </View>
        )}
      </Entry>
    ));
  }
  if (key === 'skills') {
    const groups = [
      ['technical', L.technicalSkills],
      ['professional', L.professionalSkills],
    ].map(([cat, label]) => [label, entries.filter((e) => e.category === cat).map((e) => e.name.trim())]).filter(([, items]) => items.length);
    // Sub-labels only help when both groups exist.
    if (groups.length === 1) return <Tags items={groups[0][1]} s={s} mode={opts.skillMode} />;
    return groups.map(([label, items]) => (
      <View key={label} style={{ marginBottom: 4 }}>
        <Text style={s.subLabel}>{label}</Text>
        <Tags items={items} s={s} mode={opts.skillMode} />
      </View>
    ));
  }
  if (key === 'languages') {
    return entries.map((e) => (
      <Text key={e.id} style={s.listItem}>
        <Text style={s.strong}>{e.name.trim()}</Text>
        {` — ${L.levels[e.level]}`}
      </Text>
    ));
  }
  if (key === 'interests') return <Tags items={entries.map((e) => e.name.trim())} s={s} mode={opts.interestMode ?? 'inline'} />;
  return null;
}

/**
 * Returns [{ key, title, body }] for the visible sections among `keys`, in that order.
 * Empty and hidden sections are skipped, so templates never print blank headings.
 */
export function buildSections(cv, keys, L, s, opts = {}) {
  const out = [];
  for (const key of keys) {
    if (!isSectionVisible(cv, key)) continue;
    if (key === 'customSections') {
      for (const e of filledEntries(cv, key)) {
        if (!e.title.trim() && !e.content.trim()) continue;
        out.push({ id: e.id, title: e.title.trim(), body: <RichText text={e.content} s={s} /> });
      }
    } else {
      out.push({ id: key, title: L[key], body: sectionBody(key, cv, L, s, opts) });
    }
  }
  return out;
}

export const PageNumber = ({ s }) => (
  <Text style={s.pageNumber} fixed render={({ pageNumber, totalPages }) => (totalPages > 1 ? `${pageNumber} / ${totalPages}` : '')} />
);
