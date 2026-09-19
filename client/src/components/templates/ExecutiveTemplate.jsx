function ExecutiveTemplate({ sections, colors, targetRole }) {
  const { personalInfo, summary, experience, education, skills, projects, certifications } = sections;

  const styles = {
    page: { fontFamily: "'Playfair Display', Georgia, serif", color: '#1e293b', padding: '40px 48px', lineHeight: 1.5, textAlign: 'left' },
    header: { textAlign: 'center', marginBottom: '24px' },
    name: { fontSize: '32px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '2px' },
    role: { fontSize: '16px', fontStyle: 'italic', color: '#334155', marginBottom: '12px' },
    contactRow: { display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px 16px', fontSize: '12px', color: '#475569' },
    sectionTitle: { fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', color: '#0f172a', borderBottom: '2px solid #cbd5e1', paddingBottom: '4px', marginBottom: '16px', marginTop: '24px', letterSpacing: '1px', textAlign: 'left' },
    entryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' },
    title: { fontSize: '14px', fontWeight: 'bold', color: '#0f172a' },
    subtitle: { fontSize: '14px', color: '#334155', fontStyle: 'italic' },
    dates: { fontSize: '13px', color: '#64748b', flexShrink: 0 },
    bulletList: { margin: '8px 0 0 0', paddingLeft: '24px', listStyleType: 'square', listStylePosition: 'outside' },
    bulletItem: { fontSize: '13px', color: '#334155', lineHeight: 1.6, marginBottom: '6px', textAlign: 'justify' },
    skillLine: { fontSize: '13px', color: '#334155', marginBottom: '6px', textAlign: 'justify' },
    skillLabel: { fontWeight: 'bold', color: '#0f172a' },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.name}>{personalInfo.fullName || 'Your Name'}</h1>
        {targetRole && <div style={styles.role}>{targetRole}</div>}
        <div style={styles.contactRow}>
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.linkedIn && <span>{personalInfo.linkedIn}</span>}
        </div>
      </div>

      {summary && (
        <div>
          <h2 style={styles.sectionTitle}>Executive Summary</h2>
          <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6, margin: 0 }}>{summary}</p>
        </div>
      )}

      {experience.length > 0 && (
        <div>
          <h2 style={styles.sectionTitle}>Professional Experience</h2>
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experience.length - 1 ? '24px' : 0 }}>
              <div style={styles.entryRow}>
                <div>
                  <span style={styles.title}>{exp.role}</span>
                  {exp.company && <span style={styles.subtitle}>, {exp.company}</span>}
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
                <span style={styles.title}>{edu.degree}{edu.field && ` in ${edu.field}`}</span>
                {edu.institution && <span style={styles.subtitle}>, {edu.institution}</span>}
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
          <h2 style={styles.sectionTitle}>Core Competencies</h2>
          {skills.soft.length > 0 && (
            <p style={styles.skillLine}><span style={styles.skillLabel}>Leadership: </span>{skills.soft.join(', ')}</p>
          )}
          {skills.technical.length > 0 && (
            <p style={styles.skillLine}><span style={styles.skillLabel}>Technical: </span>{skills.technical.join(', ')}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ExecutiveTemplate;
