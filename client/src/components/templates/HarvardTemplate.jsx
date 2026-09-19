function HarvardTemplate({ sections, colors, targetRole }) {
  const { personalInfo, summary, experience, education, skills, projects, certifications } = sections;

  const styles = {
    page: { fontFamily: 'Georgia, "Times New Roman", Times, serif', color: '#000', padding: '40px 48px', lineHeight: 1.4, textAlign: 'left' },
    name: { fontSize: '26px', fontWeight: 'normal', color: '#000', textAlign: 'center', margin: '0 0 4px 0', textTransform: 'uppercase' },
    contactRow: { display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '6px 12px', fontSize: '12px', color: '#000', marginBottom: '16px' },
    separator: { color: '#000' },
    hr: { border: 'none', borderTop: '1px solid #000', margin: '8px 0' },
    sectionTitle: { fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#000', borderBottom: '1px solid #000', paddingBottom: '2px', marginBottom: '8px', marginTop: '16px', textAlign: 'left' },
    entryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
    role: { fontSize: '12px', fontWeight: 'bold', color: '#000' },
    company: { fontSize: '12px', fontStyle: 'italic', color: '#000' },
    dates: { fontSize: '12px', color: '#000', flexShrink: 0 },
    bulletList: { margin: '4px 0 0 0', paddingLeft: '24px', listStyleType: 'disc', listStylePosition: 'outside' },
    bulletItem: { fontSize: '12px', color: '#000', lineHeight: 1.5, marginBottom: '2px', textAlign: 'justify' },
    skillLine: { fontSize: '12px', color: '#000', marginBottom: '2px', textAlign: 'justify' },
    skillLabel: { fontWeight: 'bold' },
    link: { color: '#000', textDecoration: 'none' },
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div>
        <h1 style={styles.name}>{personalInfo.fullName || 'Your Name'}</h1>
        <div style={styles.contactRow}>
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.email && personalInfo.phone && <span style={styles.separator}>•</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.phone && personalInfo.location && <span style={styles.separator}>•</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.linkedIn && (
            <>
              <span style={styles.separator}>•</span>
              <a href={personalInfo.linkedIn} style={styles.link}>LinkedIn</a>
            </>
          )}
          {personalInfo.portfolio && (
            <>
              <span style={styles.separator}>•</span>
              <a href={personalInfo.portfolio} style={styles.link}>Portfolio</a>
            </>
          )}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div>
          <h2 style={styles.sectionTitle}>Summary</h2>
          <p style={{ fontSize: '12px', color: '#000', lineHeight: 1.5, margin: 0 }}>{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div>
          <h2 style={styles.sectionTitle}>Experience</h2>
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experience.length - 1 ? '12px' : 0 }}>
              <div style={styles.entryRow}>
                <div>
                  <span style={styles.role}>{exp.role}</span>
                  {exp.company && <span style={styles.company}>, {exp.company}</span>}
                  {exp.location && <span style={styles.company}> - {exp.location}</span>}
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

      {/* Education */}
      {education.length > 0 && (
        <div>
          <h2 style={styles.sectionTitle}>Education</h2>
          {education.map((edu, i) => (
            <div key={i} style={{ ...styles.entryRow, marginBottom: '6px' }}>
              <div>
                <span style={styles.role}>{edu.degree}{edu.field && ` in ${edu.field}`}</span>
                {edu.institution && <span style={styles.company}>, {edu.institution}</span>}
                {edu.gpa && <span style={{ fontSize: '12px' }}> (GPA: {edu.gpa})</span>}
              </div>
              <span style={styles.dates}>
                {edu.startDate}{edu.startDate && edu.endDate && ' - '}{edu.endDate}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {(skills.technical.length > 0 || skills.soft.length > 0 || skills.languages.length > 0) && (
        <div>
          <h2 style={styles.sectionTitle}>Skills</h2>
          {skills.technical.length > 0 && (
            <p style={styles.skillLine}><span style={styles.skillLabel}>Technical: </span>{skills.technical.join(', ')}</p>
          )}
          {skills.soft.length > 0 && (
            <p style={styles.skillLine}><span style={styles.skillLabel}>Soft Skills: </span>{skills.soft.join(', ')}</p>
          )}
          {skills.languages.length > 0 && (
            <p style={styles.skillLine}><span style={styles.skillLabel}>Languages: </span>{skills.languages.join(', ')}</p>
          )}
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div>
          <h2 style={styles.sectionTitle}>Projects</h2>
          {projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={styles.role}>{proj.name}</span>
                {proj.link && <a href={proj.link} style={styles.link}>[Link]</a>}
              </div>
              {proj.description && <p style={{ fontSize: '12px', margin: '2px 0' }}>{proj.description}</p>}
              {proj.technologies?.length > 0 && (
                <p style={{ fontSize: '12px', fontStyle: 'italic', margin: '2px 0' }}>Technologies: {proj.technologies.join(', ')}</p>
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

      {/* Certifications */}
      {certifications.length > 0 && (
        <div>
          <h2 style={styles.sectionTitle}>Certifications</h2>
          {certifications.map((cert, i) => (
            <div key={i} style={{ ...styles.entryRow, marginBottom: '4px' }}>
              <div style={{ fontSize: '12px' }}>
                <span style={styles.role}>{cert.name}</span>
                {cert.issuer && <span>, {cert.issuer}</span>}
              </div>
              {cert.date && <span style={styles.dates}>{cert.date}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HarvardTemplate;
