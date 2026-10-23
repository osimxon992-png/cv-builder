// The CV designs. Each one is a different page structure, not just a colour change.
import { Page, Text, View } from '@react-pdf/renderer';
import { cvLabels } from '../i18n/cvLabels.js';
import { filledEntries, isSectionVisible } from '../lib/cvModel.js';
import { buildSections, contactItems, ContactText, makeStyles, PageNumber, Photo } from './sections.jsx';

const ALL_MAIN = ['summary', 'experience', 'education', 'projects', 'skills', 'languages', 'certifications', 'courses', 'volunteer', 'awards', 'interests', 'customSections'];

// Heading that is never left alone at the bottom of a page.
const Section = ({ title, body, s, headingExtra }) => (
  <View style={s.section}>
    <View>
      {title ? <Text style={s.heading}>{title}</Text> : null}
      {headingExtra}
    </View>
    {body}
  </View>
);

/* ---------- Classic (free): centred serif header, single column ---------- */
function Classic({ cv }) {
  const L = cvLabels(cv.cvLanguage);
  const s = makeStyles({ headingFont: 'NotoSerif', accent: '#1f2937' }, {
    heading: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, borderBottomWidth: 0.75, borderBottomColor: '#9ca3af', paddingBottom: 2 },
  });
  const p = cv.personal;
  const contacts = contactItems(p);
  return (
    <Page size="A4" style={s.page}>
      <View style={{ alignItems: 'center', marginBottom: 14 }}>
        <Text style={{ fontFamily: 'NotoSerif', fontWeight: 700, fontSize: 22, lineHeight: 1.25 }}>{p.fullName}</Text>
        {p.title ? <Text style={{ fontSize: 11.5, color: '#4b5563', marginTop: 2 }}>{p.title}</Text> : null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
          {contacts.map((c, i) => (
            <View key={c.key} style={{ flexDirection: 'row' }}>
              {i > 0 ? <Text style={{ color: '#9ca3af', marginHorizontal: 6 }}>|</Text> : null}
              <ContactText item={c} s={s} style={{ fontSize: 9, color: '#374151' }} />
            </View>
          ))}
        </View>
      </View>
      {buildSections(cv, ALL_MAIN, L, s, { skillMode: 'inline' }).map((sec) => <Section key={sec.id} {...sec} s={s} />)}
      <PageNumber s={s} />
    </Page>
  );
}

/* ---------- Modern (free): full-width colour band header with photo ---------- */
function Modern({ cv }) {
  const L = cvLabels(cv.cvLanguage);
  const accent = '#1f4e79';
  const s = makeStyles({ accent }, {
    heading: { fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 1.2 },
    chip: { backgroundColor: '#e0ecf7', color: accent },
  });
  const p = cv.personal;
  return (
    <Page size="A4" style={s.page}>
      <View style={{ marginTop: -36, marginHorizontal: -42, marginBottom: 18, paddingHorizontal: 42, paddingVertical: 24, backgroundColor: accent, flexDirection: 'row', alignItems: 'center' }}>
        <Photo cv={cv} style={{ width: 72, height: 72, borderRadius: 36, marginRight: 18, objectFit: 'cover' }} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 22, lineHeight: 1.25, fontWeight: 700, color: '#fff' }}>{p.fullName}</Text>
          {p.title ? <Text style={{ fontSize: 12, color: '#c7dbef', marginTop: 2 }}>{p.title}</Text> : null}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6, gap: 12 }}>
            {contactItems(p).map((c) => <ContactText key={c.key} item={c} s={s} style={{ fontSize: 9, color: '#fff' }} />)}
          </View>
        </View>
      </View>
      {buildSections(cv, ['summary', 'experience', 'projects', 'education', 'skills', 'languages', 'certifications', 'courses', 'volunteer', 'awards', 'interests', 'customSections'], L, s, { skillMode: 'chips', interestMode: 'chips' }).map((sec) => (
        <Section key={sec.id} {...sec} s={s} headingExtra={<View style={{ height: 1.5, width: 28, backgroundColor: accent, marginTop: -3, marginBottom: 6 }} />} />
      ))}
      <PageNumber s={s} />
    </Page>
  );
}

/* ---------- Minimal (free): section labels in a left column ---------- */
function Minimal({ cv }) {
  const L = cvLabels(cv.cvLanguage);
  const accent = '#0f766e';
  const s = makeStyles({ accent, size: 9.5 }, {
    heading: { fontSize: 8.5, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 0, paddingTop: 1 },
    section: { flexDirection: 'row', marginBottom: 10, paddingTop: 8, borderTopWidth: 0.5, borderTopColor: '#d1d5db' },
  });
  const p = cv.personal;
  return (
    <Page size="A4" style={s.page}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
        <View style={{ flex: 1, paddingRight: 16 }}>
          <Text style={{ fontSize: 20, lineHeight: 1.25, fontWeight: 700 }}>{p.fullName}</Text>
          {p.title ? <Text style={{ fontSize: 11, color: accent, marginTop: 2 }}>{p.title}</Text> : null}
        </View>
        <View style={{ alignItems: 'flex-end', maxWidth: '45%' }}>
          {contactItems(p).map((c) => <ContactText key={c.key} item={c} s={s} style={{ fontSize: 8.5, color: '#374151' }} />)}
        </View>
      </View>
      {buildSections(cv, ALL_MAIN, L, s, { skillMode: 'inline' }).map((sec) => (
        <View key={sec.id} style={s.section}>
          <View style={{ width: 110, paddingRight: 10 }}>
            <Text style={s.heading}>{sec.title}</Text>
          </View>
          <View style={{ flex: 1 }}>{sec.body}</View>
        </View>
      ))}
      <PageNumber s={s} />
    </Page>
  );
}

/* ---------- Executive (premium): dark left sidebar ---------- */
function Executive({ cv }) {
  const L = cvLabels(cv.cvLanguage);
  const navy = '#1e293b';
  const gold = '#c8a24a';
  const s = makeStyles({ accent: navy }, {
    page: { paddingHorizontal: 0 },
    heading: { fontSize: 11.5, textTransform: 'uppercase', letterSpacing: 1, borderBottomWidth: 1.5, borderBottomColor: gold, paddingBottom: 2, alignSelf: 'flex-start' },
    pageNumber: { right: 28 },
  });
  const side = makeStyles({ accent: '#fff', text: '#e2e8f0', muted: '#94a3b8', size: 9 }, {
    heading: { fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 1.2, color: gold },
    entryHead: { flexDirection: 'column' },
    entryDate: { marginLeft: 0 },
    entryTitle: { color: '#fff' },
    strong: { color: '#fff' },
    link: { color: '#e2e8f0' },
  });
  const p = cv.personal;
  return (
    <Page size="A4" style={s.page}>
      <View fixed style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '34%', backgroundColor: navy }} />
      <View style={{ flexDirection: 'row' }}>
        <View style={{ width: '34%', paddingHorizontal: 22 }}>
          <Photo cv={cv} style={{ width: 100, height: 100, borderRadius: 50, alignSelf: 'center', marginBottom: 16, objectFit: 'cover' }} />
          <Section s={side} title={L.contact} body={contactItems(p).map((c) => <ContactText key={c.key} item={c} s={side} style={{ fontSize: 8.5, marginBottom: 3, color: '#e2e8f0' }} />)} />
          {buildSections(cv, ['skills', 'languages', 'certifications', 'interests'], L, side, { skillMode: 'list', interestMode: 'list' }).map((sec) => <Section key={sec.id} {...sec} s={side} />)}
        </View>
        <View style={{ flex: 1, paddingHorizontal: 28 }}>
          <Text style={{ fontSize: 24, lineHeight: 1.25, fontWeight: 700, color: navy }}>{p.fullName}</Text>
          {p.title ? <Text style={{ fontSize: 12.5, color: '#64748b', marginBottom: 16 }}>{p.title}</Text> : <View style={{ height: 16 }} />}
          {buildSections(cv, ['summary', 'experience', 'education', 'projects', 'courses', 'volunteer', 'awards', 'customSections'], L, s).map((sec) => <Section key={sec.id} {...sec} s={s} />)}
        </View>
      </View>
      <PageNumber s={s} />
    </Page>
  );
}

/* ---------- Elegant (premium): centred serif header, two-column footer ---------- */
function Elegant({ cv }) {
  const L = cvLabels(cv.cvLanguage);
  const gold = '#9a6b2f';
  const s = makeStyles({ font: 'NotoSerif', accent: gold, text: '#2b2b2b' }, {
    heading: { fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 2.5, textAlign: 'center', marginBottom: 2 },
    entryTitle: { color: '#111' },
  });
  const rule = <View style={{ width: 36, height: 1, backgroundColor: gold, alignSelf: 'center', marginBottom: 8 }} />;
  const p = cv.personal;
  const bottom = buildSections(cv, ['skills', 'languages', 'interests'], L, s, { skillMode: 'list' });
  return (
    <Page size="A4" style={s.page}>
      <View style={{ alignItems: 'center', marginBottom: 10 }}>
        <Photo cv={cv} style={{ width: 76, height: 76, borderRadius: 38, marginBottom: 8, objectFit: 'cover' }} />
        <Text style={{ fontSize: 22, lineHeight: 1.25, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, textAlign: 'center' }}>{p.fullName}</Text>
        {p.title ? <Text style={{ fontSize: 11, color: gold, marginTop: 3, letterSpacing: 1 }}>{p.title}</Text> : null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 6 }}>
          {contactItems(p).map((c, i) => (
            <View key={c.key} style={{ flexDirection: 'row' }}>
              {i > 0 ? <Text style={{ color: gold, marginHorizontal: 6 }}>·</Text> : null}
              <ContactText item={c} s={s} style={{ fontSize: 8.5, color: '#444' }} />
            </View>
          ))}
        </View>
      </View>
      <View style={{ borderTopWidth: 1, borderTopColor: gold, marginBottom: 2 }} />
      <View style={{ borderTopWidth: 0.5, borderTopColor: gold, marginBottom: 14 }} />
      {buildSections(cv, ['summary', 'experience', 'education', 'projects', 'certifications', 'courses', 'volunteer', 'awards', 'customSections'], L, s).map((sec) => (
        <Section key={sec.id} {...sec} s={s} headingExtra={rule} />
      ))}
      {bottom.length > 0 && (
        <View style={{ flexDirection: 'row', gap: 24, borderTopWidth: 0.5, borderTopColor: gold, paddingTop: 10 }} wrap={false}>
          {bottom.map((sec) => (
            <View key={sec.id} style={{ flex: 1 }}>
              <Section {...sec} s={s} headingExtra={rule} />
            </View>
          ))}
        </View>
      )}
      <PageNumber s={s} />
    </Page>
  );
}

/* ---------- Creative (premium): right sidebar + experience timeline ---------- */
function Creative({ cv }) {
  const L = cvLabels(cv.cvLanguage);
  const teal = '#0e7490';
  const s = makeStyles({ accent: teal }, {
    page: { paddingHorizontal: 0 },
    heading: { fontSize: 12, marginBottom: 8 },
    entry: { borderLeftWidth: 1.5, borderLeftColor: '#a5d8e3', paddingLeft: 12, marginLeft: 4, paddingBottom: 6, marginBottom: 2 },
    entryDot: { position: 'absolute', left: -5, top: 3, width: 8, height: 8, borderRadius: 4, backgroundColor: teal },
    entryDate: { color: teal, fontWeight: 700 },
  });
  const side = makeStyles({ accent: teal, size: 9 }, {
    heading: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
    chip: { backgroundColor: '#fff', color: teal, borderWidth: 0.5, borderColor: '#a5d8e3' },
    entryHead: { flexDirection: 'column' },
    entryDate: { marginLeft: 0 },
  });
  const p = cv.personal;
  return (
    <Page size="A4" style={s.page}>
      <View fixed style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '32%', backgroundColor: '#ecfeff' }} />
      <View fixed style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, backgroundColor: teal }} />
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1, paddingHorizontal: 30 }}>
          <Text style={{ fontSize: 26, fontWeight: 700, color: teal, lineHeight: 1.15 }}>{p.fullName}</Text>
          {p.title ? <Text style={{ fontSize: 12.5, color: '#475569', marginTop: 2, marginBottom: 16 }}>{p.title}</Text> : <View style={{ height: 16 }} />}
          {buildSections(cv, ['summary', 'experience', 'projects', 'education', 'volunteer', 'awards', 'customSections'], L, s).map((sec) => (
            <Section key={sec.id} {...sec} s={s} />
          ))}
        </View>
        <View style={{ width: '32%', paddingHorizontal: 20 }}>
          <Photo cv={cv} style={{ width: 110, height: 110, borderRadius: 12, alignSelf: 'center', marginBottom: 16, objectFit: 'cover' }} />
          <Section s={side} title={L.contact} body={contactItems(p).map((c) => <ContactText key={c.key} item={c} s={side} style={{ fontSize: 8.5, marginBottom: 3 }} />)} />
          {buildSections(cv, ['skills', 'languages', 'certifications', 'courses', 'interests'], L, side, { skillMode: 'chips', interestMode: 'chips' }).map((sec) => (
            <Section key={sec.id} {...sec} s={side} />
          ))}
        </View>
      </View>
      <PageNumber s={s} />
    </Page>
  );
}

/* ---------- Compact (free): dense one-pager, headings run into a hairline ---------- */
function Compact({ cv }) {
  const L = cvLabels(cv.cvLanguage);
  const accent = '#334155';
  const s = makeStyles({ accent, size: 9 }, {
    page: { paddingTop: 30, paddingHorizontal: 36 },
    section: { marginBottom: 8 },
    heading: { fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 0 },
    entry: { marginBottom: 5 },
  });
  const p = cv.personal;
  return (
    <Page size="A4" style={s.page}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1.5, borderBottomColor: accent, paddingBottom: 8, marginBottom: 10 }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>{p.fullName}</Text>
          {p.title ? <Text style={{ fontSize: 10, color: '#475569' }}>{p.title}</Text> : null}
        </View>
        <View style={{ alignItems: 'flex-end', maxWidth: '48%' }}>
          {contactItems(p).map((c) => <ContactText key={c.key} item={c} s={s} style={{ fontSize: 8, color: '#334155' }} />)}
        </View>
      </View>
      {buildSections(cv, ALL_MAIN, L, s, { skillMode: 'inline' }).map((sec) => (
        <View key={sec.id} style={s.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={s.heading}>{sec.title}</Text>
            <View style={{ flex: 1, height: 0.5, backgroundColor: '#cbd5e1', marginLeft: 6 }} />
          </View>
          {sec.body}
        </View>
      ))}
      <PageNumber s={s} />
    </Page>
  );
}

/* ---------- Student (free): education and projects first, for a first CV ---------- */
function Student({ cv }) {
  const L = cvLabels(cv.cvLanguage);
  const accent = '#2563eb';
  const s = makeStyles({ accent }, {
    heading: { fontSize: 12 },
    chip: { backgroundColor: '#dbeafe', color: '#1e3a8a' },
  });
  const p = cv.personal;
  return (
    <Page size="A4" style={s.page}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>{p.fullName}</Text>
          <View style={{ width: 40, height: 3, backgroundColor: accent, marginVertical: 5 }} />
          {p.title ? <Text style={{ fontSize: 11.5, color: '#374151' }}>{p.title}</Text> : null}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
            {contactItems(p).map((c) => <ContactText key={c.key} item={c} s={s} style={{ fontSize: 8.5, color: '#374151' }} />)}
          </View>
        </View>
        <Photo cv={cv} style={{ width: 64, height: 64, borderRadius: 32, marginLeft: 16, objectFit: 'cover' }} />
      </View>
      {buildSections(cv, ['summary', 'education', 'projects', 'skills', 'experience', 'courses', 'certifications', 'languages', 'volunteer', 'awards', 'interests', 'customSections'], L, s, { skillMode: 'chips', interestMode: 'chips' }).map((sec) => <Section key={sec.id} {...sec} s={s} />)}
      <PageNumber s={s} />
    </Page>
  );
}

/* ---------- Timeline (free): dates in their own left column ---------- */
function Timeline({ cv }) {
  const L = cvLabels(cv.cvLanguage);
  const accent = '#b45309';
  const s = makeStyles({ accent }, {
    heading: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },
    entry: { paddingLeft: 92, marginBottom: 9 },
    entryHead: { marginLeft: -92, flexDirection: 'row-reverse', justifyContent: 'flex-end' },
    entryDate: { width: 82, marginLeft: 0, marginRight: 10, color: accent, fontWeight: 700 },
  });
  const p = cv.personal;
  return (
    <Page size="A4" style={s.page}>
      <View fixed style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: accent }} />
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>{p.fullName}</Text>
        {p.title ? <Text style={{ fontSize: 12, color: accent }}>{p.title}</Text> : null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
          {contactItems(p).map((c, i) => (
            <View key={c.key} style={{ flexDirection: 'row' }}>
              {i > 0 ? <Text style={{ color: '#9ca3af', marginHorizontal: 5 }}>·</Text> : null}
              <ContactText item={c} s={s} style={{ fontSize: 8.5, color: '#374151' }} />
            </View>
          ))}
        </View>
      </View>
      {buildSections(cv, ALL_MAIN, L, s, { skillMode: 'inline' }).map((sec) => <Section key={sec.id} {...sec} s={s} />)}
      <PageNumber s={s} />
    </Page>
  );
}

/* ---------- Two Column (free): main column plus a plain right column, divided by a rule ---------- */
function TwoColumn({ cv }) {
  const L = cvLabels(cv.cvLanguage);
  const accent = '#0f172a';
  const s = makeStyles({ accent }, { heading: { fontSize: 11.5 } });
  const side = makeStyles({ accent, size: 9 }, {
    heading: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
    entryHead: { flexDirection: 'column' },
    entryDate: { marginLeft: 0 },
  });
  const p = cv.personal;
  return (
    <Page size="A4" style={s.page}>
      <View style={{ borderBottomWidth: 1, borderBottomColor: accent, paddingBottom: 10, marginBottom: 14 }}>
        <Text style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>{p.fullName}</Text>
        {p.title ? <Text style={{ fontSize: 12, color: '#475569' }}>{p.title}</Text> : null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 }}>
          {contactItems(p).map((c) => <ContactText key={c.key} item={c} s={s} style={{ fontSize: 8.5, color: '#334155' }} />)}
        </View>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1, paddingRight: 18, borderRightWidth: 0.5, borderRightColor: '#cbd5e1' }}>
          {buildSections(cv, ['summary', 'experience', 'projects', 'education', 'volunteer', 'awards', 'customSections'], L, s).map((sec) => <Section key={sec.id} {...sec} s={s} />)}
        </View>
        <View style={{ width: '34%', paddingLeft: 16 }}>
          {buildSections(cv, ['skills', 'languages', 'certifications', 'courses', 'interests'], L, side, { skillMode: 'list', interestMode: 'list' }).map((sec) => <Section key={sec.id} {...sec} s={side} />)}
        </View>
      </View>
      <PageNumber s={s} />
    </Page>
  );
}

/* ---------- Developer (free): skills and projects lead, for IT roles ---------- */
function Developer({ cv }) {
  const L = cvLabels(cv.cvLanguage);
  const accent = '#15803d';
  const s = makeStyles({ accent }, {
    heading: { fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 1.2 },
    chip: { backgroundColor: '#dcfce7', color: '#14532d' },
  });
  const p = cv.personal;
  return (
    <Page size="A4" style={s.page}>
      <View style={{ marginBottom: 14, paddingBottom: 10, borderBottomWidth: 0.75, borderBottomColor: '#bbf7d0' }}>
        <Text style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>{p.fullName}</Text>
        {p.title ? <Text style={{ fontSize: 12, color: accent, fontWeight: 700 }}>{p.title}</Text> : null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 }}>
          {contactItems(p).map((c) => <ContactText key={c.key} item={c} s={s} style={{ fontSize: 8.5 }} />)}
        </View>
      </View>
      {buildSections(cv, ['summary', 'skills', 'projects', 'experience', 'education', 'certifications', 'courses', 'languages', 'volunteer', 'awards', 'interests', 'customSections'], L, s, { skillMode: 'chips', interestMode: 'chips' }).map((sec) => <Section key={sec.id} {...sec} s={s} />)}
      <PageNumber s={s} />
    </Page>
  );
}

/* ---------- Official (free): boxed table sections and a 3x4 photo, like an official résumé form ---------- */
function Official({ cv }) {
  const L = cvLabels(cv.cvLanguage);
  const line = '#6b7280';
  const s = makeStyles({ accent: '#111827' }, {
    heading: { fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 0, backgroundColor: '#e5e7eb', paddingVertical: 3, paddingHorizontal: 6, borderBottomWidth: 0.75, borderBottomColor: line },
    section: { borderWidth: 0.75, borderColor: line, marginBottom: 10 },
  });
  const p = cv.personal;
  return (
    <Page size="A4" style={s.page}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
        <View style={{ flex: 1, alignItems: 'center', paddingRight: 12 }}>
          <Text style={{ fontSize: 17, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' }}>{p.fullName}</Text>
          {p.title ? <Text style={{ fontSize: 11, color: '#374151', marginTop: 2 }}>{p.title}</Text> : null}
          <View style={{ marginTop: 8, alignSelf: 'stretch', borderWidth: 0.75, borderColor: line }}>
            {contactItems(p).map((c, i) => (
              <View key={c.key} style={{ paddingVertical: 2, paddingHorizontal: 6, borderTopWidth: i ? 0.5 : 0, borderTopColor: '#d1d5db' }}>
                <ContactText item={c} s={s} style={{ fontSize: 9 }} />
              </View>
            ))}
          </View>
        </View>
        <Photo cv={cv} style={{ width: 72, height: 96, objectFit: 'cover', borderWidth: 0.75, borderColor: line }} />
      </View>
      {buildSections(cv, ALL_MAIN, L, s, { skillMode: 'inline' }).map((sec) => (
        <View key={sec.id} style={s.section}>
          {sec.title ? <Text style={s.heading}>{sec.title}</Text> : null}
          <View style={{ padding: 6 }}>{sec.body}</View>
        </View>
      ))}
      <PageNumber s={s} />
    </Page>
  );
}

/* ---------- Bold (premium): oversized name with a colour block, heavy headings ---------- */
function Bold({ cv }) {
  const L = cvLabels(cv.cvLanguage);
  const accent = '#e11d48';
  const s = makeStyles({ accent: '#111111', text: '#1f2937' }, {
    heading: { fontSize: 15, marginBottom: 0, lineHeight: 1.3 },
    chip: { backgroundColor: '#111111', color: '#ffffff' },
  });
  const bar = <View style={{ width: 36, height: 4, backgroundColor: accent, marginTop: 3, marginBottom: 8 }} />;
  const p = cv.personal;
  return (
    <Page size="A4" style={s.page}>
      <View style={{ flexDirection: 'row', marginBottom: 18 }}>
        <View style={{ width: 10, backgroundColor: accent, marginRight: 14 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.05, color: '#111111' }}>{p.fullName}</Text>
          {p.title ? <Text style={{ fontSize: 13, color: accent, fontWeight: 700, marginTop: 4 }}>{p.title}</Text> : null}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 6 }}>
            {contactItems(p).map((c) => <ContactText key={c.key} item={c} s={s} style={{ fontSize: 8.5, color: '#374151' }} />)}
          </View>
        </View>
      </View>
      {buildSections(cv, ALL_MAIN, L, s, { skillMode: 'chips', interestMode: 'chips' }).map((sec) => <Section key={sec.id} {...sec} s={s} headingExtra={bar} />)}
      <PageNumber s={s} />
    </Page>
  );
}

/* ---------- Corporate (premium): dark header band over a light left sidebar ---------- */
function Corporate({ cv }) {
  const L = cvLabels(cv.cvLanguage);
  const accent = '#0c4a6e';
  const s = makeStyles({ accent }, {
    page: { paddingHorizontal: 0 },
    heading: { fontSize: 11.5, borderBottomWidth: 1, borderBottomColor: '#bae6fd', paddingBottom: 2 },
    pageNumber: { right: 28 },
  });
  const side = makeStyles({ accent, size: 9 }, {
    heading: { fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 1 },
    entryHead: { flexDirection: 'column' },
    entryDate: { marginLeft: 0 },
  });
  const p = cv.personal;
  return (
    <Page size="A4" style={s.page}>
      <View fixed style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '32%', backgroundColor: '#f1f5f9' }} />
      <View style={{ marginTop: -36, marginBottom: 18, paddingHorizontal: 28, paddingVertical: 22, backgroundColor: accent, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2, color: '#fff' }}>{p.fullName}</Text>
          {p.title ? <Text style={{ fontSize: 12, color: '#bae6fd', marginTop: 2 }}>{p.title}</Text> : null}
        </View>
        <Photo cv={cv} style={{ width: 70, height: 70, borderRadius: 4, objectFit: 'cover' }} />
      </View>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ width: '32%', paddingHorizontal: 20 }}>
          <Section s={side} title={L.contact} body={contactItems(p).map((c) => <ContactText key={c.key} item={c} s={side} style={{ fontSize: 8.5, marginBottom: 3 }} />)} />
          {buildSections(cv, ['skills', 'languages', 'certifications', 'courses', 'interests'], L, side, { skillMode: 'list', interestMode: 'list' }).map((sec) => <Section key={sec.id} {...sec} s={side} />)}
        </View>
        <View style={{ flex: 1, paddingHorizontal: 26 }}>
          {buildSections(cv, ['summary', 'experience', 'education', 'projects', 'volunteer', 'awards', 'customSections'], L, s).map((sec) => <Section key={sec.id} {...sec} s={s} />)}
        </View>
      </View>
      <PageNumber s={s} />
    </Page>
  );
}

/* ---------- Academic (premium): serif, education first, justified text ---------- */
function Academic({ cv }) {
  const L = cvLabels(cv.cvLanguage);
  const accent = '#7f1d1d';
  const s = makeStyles({ font: 'NotoSerif', accent, text: '#1c1917', size: 9.5 }, {
    heading: { fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 1.5, borderBottomWidth: 0.5, borderBottomColor: accent, paddingBottom: 2 },
    body: { textAlign: 'justify' },
  });
  const p = cv.personal;
  return (
    <Page size="A4" style={s.page}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4 }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>{p.fullName}</Text>
          {p.title ? <Text style={{ fontSize: 11, color: accent }}>{p.title}</Text> : null}
        </View>
        <View style={{ alignItems: 'flex-end', maxWidth: '45%' }}>
          {contactItems(p).map((c) => <ContactText key={c.key} item={c} s={s} style={{ fontSize: 8.5 }} />)}
        </View>
      </View>
      <View style={{ borderTopWidth: 1.5, borderTopColor: accent, marginBottom: 1.5 }} />
      <View style={{ borderTopWidth: 0.5, borderTopColor: accent, marginBottom: 14 }} />
      {buildSections(cv, ['summary', 'education', 'experience', 'projects', 'awards', 'certifications', 'courses', 'volunteer', 'skills', 'languages', 'interests', 'customSections'], L, s, { skillMode: 'inline' }).map((sec) => <Section key={sec.id} {...sec} s={s} />)}
      <PageNumber s={s} />
    </Page>
  );
}

/* ---------- Split (premium): two-tone header, square-marked headings ---------- */
function Split({ cv }) {
  const L = cvLabels(cv.cvLanguage);
  const accent = '#6d28d9';
  const s = makeStyles({ accent }, { heading: { fontSize: 12, marginBottom: 0 } });
  const p = cv.personal;
  return (
    <Page size="A4" style={s.page}>
      <View style={{ flexDirection: 'row', marginTop: -36, marginHorizontal: -42, marginBottom: 18 }}>
        <View style={{ width: '56%', backgroundColor: accent, paddingVertical: 24, paddingLeft: 42, paddingRight: 18, flexDirection: 'row', alignItems: 'center' }}>
          <Photo cv={cv} style={{ width: 60, height: 60, borderRadius: 30, marginRight: 14, objectFit: 'cover' }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.2, color: '#fff' }}>{p.fullName}</Text>
            {p.title ? <Text style={{ fontSize: 11, color: '#ddd6fe', marginTop: 2 }}>{p.title}</Text> : null}
          </View>
        </View>
        <View style={{ flex: 1, backgroundColor: '#f5f3ff', paddingVertical: 20, paddingLeft: 18, paddingRight: 42, justifyContent: 'center' }}>
          {contactItems(p).map((c) => <ContactText key={c.key} item={c} s={s} style={{ fontSize: 8.5, color: '#4c1d95', marginBottom: 2 }} />)}
        </View>
      </View>
      {buildSections(cv, ALL_MAIN, L, s, { skillMode: 'chips', interestMode: 'chips' }).map((sec) => (
        <View key={sec.id} style={s.section}>
          {sec.title ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <View style={{ width: 7, height: 7, backgroundColor: accent, marginRight: 7 }} />
              <Text style={s.heading}>{sec.title}</Text>
            </View>
          ) : null}
          {sec.body}
        </View>
      ))}
      <PageNumber s={s} />
    </Page>
  );
}

/* ---------- Infographic (premium): tinted sidebar with language level dots ---------- */
const LEVEL_DOTS = { beginner: 1, intermediate: 2, advanced: 3, fluent: 4, native: 5 };

function Infographic({ cv }) {
  const L = cvLabels(cv.cvLanguage);
  const accent = '#ea580c';
  const s = makeStyles({ accent, text: '#1c1917' }, {
    page: { paddingHorizontal: 0 },
    heading: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 0 },
    pageNumber: { right: 28 },
  });
  const side = makeStyles({ accent, size: 9 }, {
    heading: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
    chip: { backgroundColor: '#ffffff', color: '#9a3412', borderWidth: 0.5, borderColor: '#fdba74' },
    entryHead: { flexDirection: 'column' },
    entryDate: { marginLeft: 0 },
  });
  const p = cv.personal;
  const languages = isSectionVisible(cv, 'languages') ? filledEntries(cv, 'languages') : [];
  return (
    <Page size="A4" style={s.page}>
      <View fixed style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '33%', backgroundColor: '#fff7ed' }} />
      <View style={{ flexDirection: 'row' }}>
        <View style={{ width: '33%', paddingHorizontal: 20 }}>
          <Photo cv={cv} style={{ width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: accent, alignSelf: 'center', marginBottom: 16, objectFit: 'cover' }} />
          <Section s={side} title={L.contact} body={contactItems(p).map((c) => <ContactText key={c.key} item={c} s={side} style={{ fontSize: 8.5, marginBottom: 3 }} />)} />
          {buildSections(cv, ['skills'], L, side, { skillMode: 'chips' }).map((sec) => <Section key={sec.id} {...sec} s={side} />)}
          {languages.length > 0 && (
            <Section
              s={side}
              title={L.languages}
              body={languages.map((e) => (
                <View key={e.id} style={{ marginBottom: 4 }} wrap={false}>
                  <Text style={{ fontWeight: 700 }}>{e.name.trim()}</Text>
                  <View style={{ flexDirection: 'row', gap: 3, marginTop: 2 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <View key={n} style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: n <= (LEVEL_DOTS[e.level] ?? 0) ? accent : '#fed7aa' }} />
                    ))}
                  </View>
                </View>
              ))}
            />
          )}
          {buildSections(cv, ['certifications', 'interests'], L, side, { interestMode: 'chips' }).map((sec) => <Section key={sec.id} {...sec} s={side} />)}
        </View>
        <View style={{ flex: 1, paddingHorizontal: 26 }}>
          <Text style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.15 }}>{p.fullName}</Text>
          {p.title ? <Text style={{ fontSize: 12.5, color: accent, marginTop: 2, marginBottom: 16 }}>{p.title}</Text> : <View style={{ height: 16 }} />}
          {buildSections(cv, ['summary', 'experience', 'education', 'projects', 'courses', 'volunteer', 'awards', 'customSections'], L, s).map((sec) => (
            <View key={sec.id} style={s.section}>
              {sec.title ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: accent, marginRight: 7 }} />
                  <Text style={s.heading}>{sec.title}</Text>
                </View>
              ) : null}
              {sec.body}
            </View>
          ))}
        </View>
      </View>
      <PageNumber s={s} />
    </Page>
  );
}

/* ---------- Ink (premium): indigo hairlines and tracked caps, after the site's own look ---------- */
function Ink({ cv }) {
  const L = cvLabels(cv.cvLanguage);
  const ink = '#0a1a33';
  const dilute = '#606d80';
  const s = makeStyles({ accent: ink, text: '#1e2d4a', muted: dilute }, {
    heading: { fontSize: 8.5, fontWeight: 400, textTransform: 'uppercase', letterSpacing: 2.5, color: dilute, borderBottomWidth: 0.5, borderBottomColor: '#aeb6c2', paddingBottom: 3, marginBottom: 7 },
    entryTitle: { color: ink },
  });
  // Suminagashi rings: ink and clear water around one drop.
  const ring = (size, color, child) => (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>{child}</View>
  );
  const p = cv.personal;
  return (
    <Page size="A4" style={s.page}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <View style={{ marginRight: 12 }}>{ring(26, ink, ring(18, '#ffffff', ring(10, ink)))}</View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 24, color: ink, letterSpacing: 0.3, lineHeight: 1.2 }}>{p.fullName}</Text>
          {p.title ? <Text style={{ fontSize: 8.5, color: dilute, textTransform: 'uppercase', letterSpacing: 2 }}>{p.title}</Text> : null}
        </View>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingVertical: 6, borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: '#aeb6c2', marginBottom: 14 }}>
        {contactItems(p).map((c) => <ContactText key={c.key} item={c} s={s} style={{ fontSize: 8.5, color: '#1e2d4a' }} />)}
      </View>
      {buildSections(cv, ALL_MAIN, L, s, { skillMode: 'inline' }).map((sec) => <Section key={sec.id} {...sec} s={s} />)}
      <PageNumber s={s} />
    </Page>
  );
}

export const TEMPLATE_PAGES = {
  classic: Classic,
  modern: Modern,
  minimal: Minimal,
  compact: Compact,
  student: Student,
  timeline: Timeline,
  twocolumn: TwoColumn,
  developer: Developer,
  official: Official,
  executive: Executive,
  elegant: Elegant,
  creative: Creative,
  bold: Bold,
  corporate: Corporate,
  academic: Academic,
  split: Split,
  infographic: Infographic,
  ink: Ink,
};
