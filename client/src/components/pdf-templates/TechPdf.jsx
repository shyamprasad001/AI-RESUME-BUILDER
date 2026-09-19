import { View, Text, Link, StyleSheet } from '@react-pdf/renderer';

function TechPdf({ sections, colors, targetRole }) {
  const { personalInfo, summary, experience, education, skills, projects, certifications } = sections;

  const styles = StyleSheet.create({
    page: { padding: 36, fontFamily: 'Helvetica', color: '#333333', fontSize: 10, lineHeight: 1.4 },
    name: { fontSize: 24, fontFamily: 'Helvetica-Bold', color: '#111111', marginBottom: 2 },
    role: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#444444', marginBottom: 8 },
    contactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, fontSize: 10, color: '#555555', marginBottom: 12 },
    sectionTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', color: '#111111', borderBottom: '2pt solid #111111', paddingBottom: 3, marginBottom: 8, marginTop: 12 },
    section: { marginBottom: 8 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 },
    title: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#111111' },
    subtitle: { fontSize: 11, color: '#444444' },
    dates: { fontSize: 10, color: '#666666' },
    bulletItem: { flexDirection: 'row', marginLeft: 12, marginTop: 2 },
    bulletDot: { width: 8, fontSize: 10 },
    bulletText: { flex: 1, fontSize: 10, lineHeight: 1.4, textAlign: 'justify' },
    skillLine: { fontSize: 10, marginTop: 2, color: '#333333', textAlign: 'justify' },
    bold: { fontFamily: 'Helvetica-Bold', color: '#111111' },
    link: { color: '#0066cc', textDecoration: 'none' },
    text: { fontSize: 10, lineHeight: 1.4, textAlign: 'justify' }
  });

  return (
    <View style={styles.page}>
      <View>
        <Text style={styles.name}>{personalInfo.fullName || 'Your Name'}</Text>
        {targetRole && <Text style={styles.role}>{targetRole}</Text>}
        <View style={styles.contactRow}>
          {personalInfo.email && <Text>{personalInfo.email}</Text>}
          {personalInfo.phone && <Text>{personalInfo.phone}</Text>}
          {personalInfo.location && <Text>{personalInfo.location}</Text>}
          {personalInfo.linkedIn && <Link src={personalInfo.linkedIn} style={styles.link}>LinkedIn</Link>}
          {personalInfo.portfolio && <Link src={personalInfo.portfolio} style={styles.link}>GitHub/Portfolio</Link>}
        </View>
      </View>

      {(skills.technical.length > 0 || skills.soft.length > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technical Skills</Text>
          {skills.technical.length > 0 && (
            <Text style={styles.skillLine}>
              <Text style={styles.bold}>Languages & Tools: </Text>
              {skills.technical.join(', ')}
            </Text>
          )}
          {skills.soft.length > 0 && (
            <Text style={styles.skillLine}>
              <Text style={styles.bold}>Core Competencies: </Text>
              {skills.soft.join(', ')}
            </Text>
          )}
        </View>
      )}

      {experience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {experience.map((exp, i) => (
            <View key={i} style={{ marginBottom: 8 }}>
              <View style={styles.row}>
                <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
                  <Text style={styles.title}>{exp.role}</Text>
                  {exp.company && <Text style={styles.subtitle}> | {exp.company}</Text>}
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

      {projects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projects</Text>
          {projects.map((proj, i) => (
            <View key={i} style={{ marginBottom: 8 }}>
              <View style={styles.row}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <Text style={styles.title}>{proj.name}</Text>
                  {proj.link && <Link src={proj.link} style={styles.link}>[Link]</Link>}
                </View>
              </View>
              {proj.technologies && proj.technologies.length > 0 && (
                <Text style={{ fontSize: 9, color: '#555555', marginTop: 2, marginBottom: 2 }}>
                  {proj.technologies.join(' | ')}
                </Text>
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

      {education.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {education.map((edu, i) => (
            <View key={i} style={styles.row}>
              <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
                <Text style={styles.title}>{edu.degree}{edu.field && ` in ${edu.field}`}</Text>
                {edu.institution && <Text style={styles.subtitle}>, {edu.institution}</Text>}
              </View>
              <Text style={styles.dates}>
                {edu.startDate}{edu.startDate && edu.endDate ? ' - ' : ''}{edu.endDate}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default TechPdf;
