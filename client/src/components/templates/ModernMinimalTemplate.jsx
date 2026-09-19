function ModernMinimalTemplate({ sections, colors, targetRole }) {
  const { personalInfo, summary, experience, education, skills, projects, certifications } = sections;

  const styles = {
    page: { fontFamily: "'Inter', sans-serif", color: '#262626', padding: '40px 48px', lineHeight: 1.5, textAlign: 'left' },
    header: { marginBottom: '24px', textAlign: 'center' },
    name: { fontSize: '24px', fontWeight: '300', color: '#171717', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'center' },
    contactRow: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 16px', fontSize: '11px', color: '#737373', textTransform: 'uppercase', letterSpacing: '1px' },
    sectionTitle: { fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px', color: '#525252', paddingBottom: '8px', marginBottom: '16px', marginTop: '24px', textAlign: 'left' },
    entryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' },
    title: { fontSize: '13px', fontWeight: '600', color: '#171717' },
    subtitle: { fontSize: '13px', color: '#525252' },
    dates: { fontSize: '11px', color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '1px' },
    bulletList: { margin: '8px 0 0 0', paddingLeft: '24px', listStyleType: 'disc', listStylePosition: 'outside' },
    bulletItem: { fontSize: '12px', color: '#404040', lineHeight: 1.6, marginBottom: '4px', textAlign: 'justify' },
    skillLine: { fontSize: '12px', color: '#404040', marginBottom: '4px', textAlign: 'justify' },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.name}>{personalInfo.fullName || 'Your Name'}</h1>
        <div style={styles.contactRow}>
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.linkedIn && <span>{personalInfo.linkedIn}</span>}
        </div>
      </div>

      {summary && (
        <div>
          <h2 style={styles.sectionTitle}>Summary</h2>
          <p style={{ fontSize: '12px', color: '#404040', lineHeight: 1.6, margin: 0 }}>{summary}</p>
        </div>
      )}

      {experience.length > 0 && (
        <div>
          <h2 style={styles.sectionTitle}>Experience</h2>
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experience.length - 1 ? '20px' : 0 }}>
              <div style={styles.entryRow}>
                <div>
                  <span style={styles.title}>{exp.role}</span>
                  {exp.company && <span style={styles.subtitle}> / {exp.company}</span>}
                </div>
                <span style={styles.dates}>
                  {exp.startDate}{exp.startDate && (exp.endDate || exp.current) && ' - '}
                  {exp.current ? 'Present' : exp.endDate}
                </span>
              </div>
              {exp.bullets && exp.bullets.length > 0 && (
                <ul style={styles.bulletList}>
                  {exp.bullets.map((bullet, j) => (
                    <li key={j} style={styles.bulletItem}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div>
          <h2 style={styles.sectionTitle}>Education</h2>
          {education.map((edu, i) => (
            <div key={i} style={{ ...styles.entryRow, marginBottom: '12px' }}>
              <div>
                <span style={styles.title}>{edu.degree}{edu.field && ` - ${edu.field}`}</span>
                {edu.institution && <span style={styles.subtitle}> / {edu.institution}</span>}
              </div>
              <span style={styles.dates}>
                {edu.startDate}{edu.startDate && edu.endDate && ' - '}{edu.endDate}
              </span>
            </div>
          ))}
        </div>
      )}

      {(skills.technical.length > 0 || skills.soft.length > 0) && (
        <div>
          <h2 style={styles.sectionTitle}>Skills</h2>
          {skills.technical.length > 0 && (
            <p style={styles.skillLine}><span style={{ fontWeight: '600' }}>Tech: </span>{skills.technical.join(' • ')}</p>
          )}
          {skills.soft.length > 0 && (
            <p style={styles.skillLine}><span style={{ fontWeight: '600' }}>Soft: </span>{skills.soft.join(' • ')}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ModernMinimalTemplate;
