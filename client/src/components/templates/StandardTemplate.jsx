function StandardTemplate({ sections, colors, targetRole }) {
  const { personalInfo, summary, experience, education, skills, projects, certifications } = sections;

  const styles = {
    page: { fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", color: '#000', padding: '40px 48px', lineHeight: 1.35, textAlign: 'left' },
    name: { fontSize: '24px', fontWeight: 'bold', color: '#000', textAlign: 'center', margin: '0 0 8px 0' },
    contactRow: { display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px 12px', fontSize: '12px', color: '#000', marginBottom: '16px' },
    separator: { color: '#000' },
    sectionTitle: { fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', color: '#000', borderBottom: '1px solid #000', paddingBottom: '2px', marginBottom: '12px', marginTop: '16px', textAlign: 'left' },
    entryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' },
    role: { fontSize: '13px', fontWeight: 'bold', color: '#000' },
    company: { fontSize: '13px', color: '#000' },
    dates: { fontSize: '12px', color: '#000', flexShrink: 0 },
    bulletList: { margin: '4px 0 0 0', paddingLeft: '24px', listStyleType: 'disc', listStylePosition: 'outside' },
    bulletItem: { fontSize: '12px', color: '#000', lineHeight: 1.4, marginBottom: '3px', textAlign: 'justify' },
    skillLine: { fontSize: '12px', color: '#000', marginBottom: '4px', textAlign: 'justify' },
    skillLabel: { fontWeight: 'bold' },
    link: { color: '#000' },
  };

  return (
    <div style={styles.page}>
      <div>
        <h1 style={styles.name}>{personalInfo.fullName || 'Your Name'}</h1>
        <div style={styles.contactRow}>
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.email && personalInfo.phone && <span style={styles.separator}>|</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.phone && personalInfo.location && <span style={styles.separator}>|</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.linkedIn && (
            <>
              <span style={styles.separator}>|</span>
              <a href={personalInfo.linkedIn} style={styles.link}>LinkedIn</a>
            </>
          )}
        </div>
      </div>

      {summary && (
        <div>
          <h2 style={styles.sectionTitle}>Summary</h2>
          <p style={{ fontSize: '12px', color: '#000', lineHeight: 1.4, margin: 0 }}>{summary}</p>
        </div>
      )}

      {experience.length > 0 && (
        <div>
          <h2 style={styles.sectionTitle}>Professional Experience</h2>
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experience.length - 1 ? '16px' : 0 }}>
              <div style={styles.entryRow}>
                <div>
                  <div style={styles.role}>{exp.role}</div>
                  {exp.company && <div style={styles.company}>{exp.company}</div>}
                </div>
                <div style={styles.dates}>
                  {exp.startDate}{exp.startDate && (exp.endDate || exp.current) && ' - '}
                  {exp.current ? 'Present' : exp.endDate}
                </div>
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
            <div key={i} style={{ ...styles.entryRow, marginBottom: '8px' }}>
              <div>
                <div style={styles.role}>{edu.degree}{edu.field && ` in ${edu.field}`}</div>
                {edu.institution && <div style={styles.company}>{edu.institution}</div>}
              </div>
              <div style={styles.dates}>
                {edu.startDate}{edu.startDate && edu.endDate && ' - '}{edu.endDate}
              </div>
            </div>
          ))}
        </div>
      )}

      {(skills.technical.length > 0 || skills.soft.length > 0 || skills.languages.length > 0) && (
        <div>
          <h2 style={styles.sectionTitle}>Skills</h2>
          {skills.technical.length > 0 && (
            <p style={styles.skillLine}><span style={styles.skillLabel}>Technical: </span>{skills.technical.join(', ')}</p>
          )}
          {skills.soft.length > 0 && (
            <p style={styles.skillLine}><span style={styles.skillLabel}>Soft Skills: </span>{skills.soft.join(', ')}</p>
          )}
        </div>
      )}

      {projects.length > 0 && (
        <div>
          <h2 style={styles.sectionTitle}>Projects</h2>
          {projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{proj.name}</div>
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
    </div>
  );
}

export default StandardTemplate;
