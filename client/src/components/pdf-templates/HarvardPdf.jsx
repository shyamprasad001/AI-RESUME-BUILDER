import { View, Text, Link, StyleSheet } from '@react-pdf/renderer';

function HarvardPdf({ sections, colors, targetRole }) {
  const { personalInfo, summary, experience, education, skills, projects, certifications } = sections;

  const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Times-Roman', color: '#000', fontSize: 11, lineHeight: 1.4 },
    name: { fontSize: 24, fontFamily: 'Times-Roman', color: '#000', textAlign: 'center', marginBottom: 4, textTransform: 'uppercase' },
    contactRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 6, fontSize: 10, color: '#000', marginBottom: 12 },
    separator: { color: '#000', marginHorizontal: 4 },
    sectionTitle: { fontSize: 11, fontFamily: 'Times-Bold', textTransform: 'uppercase', color: '#000', borderBottom: '1pt solid #000', paddingBottom: 2, marginBottom: 6, marginTop: 12 },
    section: { marginBottom: 8 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 },
    role: { fontSize: 11, fontFamily: 'Times-Bold', color: '#000' },
    company: { fontSize: 11, fontFamily: 'Times-Italic', color: '#000' },
    dates: { fontSize: 11, color: '#000' },
    bulletItem: { flexDirection: 'row', marginLeft: 12, marginTop: 2 },
    bulletDot: { width: 8, fontSize: 11 },
    bulletText: { flex: 1, fontSize: 11, lineHeight: 1.4, textAlign: 'justify' },
    skillLine: { fontSize: 11, marginTop: 2, color: '#000', textAlign: 'justify' },
    bold: { fontFamily: 'Times-Bold' },
    link: { color: '#000', textDecoration: 'none' },
    text: { fontSize: 11, lineHeight: 1.4, color: '#000', textAlign: 'justify' }
  });

  return (
    <View style={styles.page}>
      {/* Header */}
      <View>
        <Text style={styles.name}>{personalInfo.fullName || 'Your Name'}</Text>
        <View style={styles.contactRow}>
          {personalInfo.email && <Text>{personalInfo.email}</Text>}
          {personalInfo.email && personalInfo.phone && <Text style={styles.separator}>•</Text>}
          {personalInfo.phone && <Text>{personalInfo.phone}</Text>}
          {personalInfo.phone && personalInfo.location && <Text style={styles.separator}>•</Text>}
          {personalInfo.location && <Text>{personalInfo.location}</Text>}
          {personalInfo.linkedIn && (
            <>
              <Text style={styles.separator}>•</Text>
              <Link src={personalInfo.linkedIn} style={styles.link}>LinkedIn</Link>
            </>
          )}
          {personalInfo.portfolio && (
            <>
              <Text style={styles.separator}>•</Text>
              <Link src={personalInfo.portfolio} style={styles.link}>Portfolio</Link>
            </>
          )}
        </View>
      </View>

      {/* Summary */}
      {summary ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.text}>{summary}</Text>
        </View>
      ) : null}

      {/* Experience */}
      {experience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {experience.map((exp, i) => (
            <View key={i} style={{ marginBottom: 8 }}>
              <View style={styles.row}>
                <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
                  <Text style={styles.role}>{exp.role}</Text>
                  {exp.company && <Text style={styles.company}>, {exp.company}</Text>}
                  {exp.location && <Text style={styles.company}> - {exp.location}</Text>}
                </View>
                <Text style={styles.dates}>
                  {exp.startDate}{exp.startDate && (exp.endDate || exp.current) ? ' - ' : ''}
                  {exp.current ? 'Present' : exp.endDate}
                </Text>
              </View>
              {exp.bullets && exp.bullets.map((bullet, j) => (
                <View key={j} style={styles.bulletItem}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{bullet}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* Education */}
      {education.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {education.map((edu, i) => (
            <View key={i} style={styles.row}>
              <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
                <Text style={styles.role}>{edu.degree}{edu.field && ` in ${edu.field}`}</Text>
                {edu.institution && <Text style={styles.company}>, {edu.institution}</Text>}
                {edu.gpa && <Text style={{ fontSize: 11 }}> (GPA: {edu.gpa})</Text>}
              </View>
              <Text style={styles.dates}>
                {edu.startDate}{edu.startDate && edu.endDate ? ' - ' : ''}{edu.endDate}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Skills */}
      {(skills.technical.length > 0 || skills.soft.length > 0 || skills.languages.length > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          {skills.technical.length > 0 && (
            <Text style={styles.skillLine}>
              <Text style={styles.bold}>Technical: </Text>
              {skills.technical.join(', ')}
            </Text>
          )}
          {skills.soft.length > 0 && (
            <Text style={styles.skillLine}>
              <Text style={styles.bold}>Soft Skills: </Text>
              {skills.soft.join(', ')}
            </Text>
          )}
          {skills.languages.length > 0 && (
            <Text style={styles.skillLine}>
              <Text style={styles.bold}>Languages: </Text>
              {skills.languages.join(', ')}
            </Text>
          )}
        </View>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projects</Text>
          {projects.map((proj, i) => (
            <View key={i} style={{ marginBottom: 6 }}>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                <Text style={styles.role}>{proj.name}</Text>
                {proj.link && <Link src={proj.link} style={styles.link}>[Link]</Link>}
              </View>
              {proj.description && <Text style={[styles.text, { marginTop: 2 }]}>{proj.description}</Text>}
              {proj.technologies && proj.technologies.length > 0 && (
                <Text style={[styles.company, { marginTop: 2 }]}>Technologies: {proj.technologies.join(', ')}</Text>
              )}
              {proj.bullets && proj.bullets.map((bullet, j) => (
                <View key={j} style={styles.bulletItem}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{bullet}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          {certifications.map((cert, i) => (
            <View key={i} style={styles.row}>
              <View style={{ flexDirection: 'row', flex: 1 }}>
                <Text style={styles.role}>{cert.name}</Text>
                {cert.issuer && <Text>, {cert.issuer}</Text>}
              </View>
              {cert.date && <Text style={styles.dates}>{cert.date}</Text>}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default HarvardPdf;
