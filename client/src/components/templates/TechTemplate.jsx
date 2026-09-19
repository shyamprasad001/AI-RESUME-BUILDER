function TechTemplate({ sections, colors, targetRole }) {
  const { personalInfo, summary, experience, education, skills, projects, certifications } = sections;

  const styles = {
    page: { fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif", color: '#333', padding: '36px 40px', lineHeight: 1.4, textAlign: 'left' },
    name: { fontSize: '28px', fontWeight: 'bold', color: '#111', margin: '0 0 4px 0', textAlign: 'center' },
    role: { fontSize: '14px', fontWeight: '600', color: '#444', marginBottom: '8px', textAlign: 'center' },
    contactRow: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 16px', fontSize: '12px', color: '#555', marginBottom: '16px' },
    sectionTitle: { fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', color: '#111', borderBottom: '2px solid #111', paddingBottom: '4px', marginBottom: '12px', marginTop: '16px', textAlign: 'left' },
    entryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' },
    entryTitle: { fontSize: '13px', fontWeight: 'bold', color: '#111' },
    entrySubtitle: { fontSize: '13px', color: '#444' },
    dates: { fontSize: '12px', color: '#666', flexShrink: 0 },
    bulletList: { margin: '4px 0 0 0', paddingLeft: '24px', listStyleType: 'disc', listStylePosition: 'outside' },
    bulletItem: { fontSize: '12px', color: '#333', lineHeight: 1.5, marginBottom: '4px', textAlign: 'justify' },
    skillLine: { fontSize: '12px', color: '#333', marginBottom: '4px', textAlign: 'justify' },
    skillLabel: { fontWeight: 'bold', color: '#111' },
    link: { color: '#0066cc', textDecoration: 'none' },
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div>
        <h1 style={styles.name}>{personalInfo.fullName || 'Your Name'}</h1>
        {targetRole && <div style={styles.role}>{targetRole}</div>}
        <div style={styles.contactRow}>
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.linkedIn && <a href={personalInfo.linkedIn} style={styles.link}>LinkedIn</a>}
          {personalInfo.portfolio && <a href={personalInfo.portfolio} style={styles.link}>Portfolio/GitHub</a>}
        </div>
      </div>

      {/* Skills (Tech format usually puts skills near the top) */}
      {(skills.technical.length > 0 || skills.soft.length > 0 || skills.languages.length > 0) && (
        <div>
          <h2 style={styles.sectionTitle}>Technical Skills</h2>
          {skills.technical.length > 0 && (
            <p style={styles.skillLine}><span style={styles.skillLabel}>Languages & Tools: </span>{skills.technical.join(', ')}</p>
          )}
          {skills.soft.length > 0 && (
            <p style={styles.skillLine}><span style={styles.skillLabel}>Core Competencies: </span>{skills.soft.join(', ')}</p>
          )}
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div>
          <h2 style={styles.sectionTitle}>Experience</h2>
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experience.length - 1 ? '16px' : 0 }}>
              <div style={styles.entryRow}>
                <div>
                  <span style={styles.entryTitle}>{exp.role}</span>
                  {exp.company && <span style={styles.entrySubtitle}> | {exp.company}</span>}
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

      {/* Projects */}
      {projects.length > 0 && (
        <div>
          <h2 style={styles.sectionTitle}>Projects</h2>
          {projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              <div style={styles.entryRow}>
                <div>
                  <span style={styles.entryTitle}>{proj.name}</span>
                  {proj.link && <a href={proj.link} style={{ ...styles.link, marginLeft: '8px', fontSize: '12px' }}>[Link]</a>}
                </div>
              </div>
              {proj.technologies?.length > 0 && (
                <p style={{ fontSize: '12px', color: '#555', margin: '2px 0 4px 0' }}>{proj.technologies.join(' | ')}</p>
              )}
              {proj.bullets?.length > 0 && (
                <ul style={styles.bulletList}>
                  {proj.bullets.map((bullet, j) => (
                    <li key={j} style={styles.bulletItem}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div>
          <h2 style={styles.sectionTitle}>Education</h2>
          {education.map((edu, i) => (
            <div key={i} style={{ ...styles.entryRow, marginBottom: '8px' }}>
              <div>
                <span style={styles.entryTitle}>{edu.degree}{edu.field && ` in ${edu.field}`}</span>
                {edu.institution && <span style={styles.entrySubtitle}>, {edu.institution}</span>}
              </div>
              <span style={styles.dates}>
                {edu.startDate}{edu.startDate && edu.endDate && ' - '}{edu.endDate}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TechTemplate;
