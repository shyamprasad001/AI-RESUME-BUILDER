import { View, Text, Link, StyleSheet } from '@react-pdf/renderer';

function StandardPdf({ sections, colors, targetRole }) {
  const { personalInfo, summary, experience, education, skills, projects, certifications } = sections;

  const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica', color: '#000000', fontSize: 11, lineHeight: 1.35 },
    name: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#000000', textAlign: 'center', marginBottom: 6 },
    contactRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 8, fontSize: 10, color: '#000000', marginBottom: 16 },
    separator: { color: '#000000', marginHorizontal: 2 },
    sectionTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', color: '#000000', borderBottom: '1pt solid #000000', paddingBottom: 2, marginBottom: 8, marginTop: 12 },
    section: { marginBottom: 10 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 },
    title: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#000000' },
    company: { fontSize: 11, color: '#000000' },
    dates: { fontSize: 11, color: '#000000' },
    bulletItem: { flexDirection: 'row', marginLeft: 12, marginTop: 2 },
    bulletDot: { width: 8, fontSize: 11 },
    bulletText: { flex: 1, fontSize: 11, lineHeight: 1.4, textAlign: 'justify' },
    skillLine: { fontSize: 11, marginTop: 3, color: '#000000', textAlign: 'justify' },
    bold: { fontFamily: 'Helvetica-Bold' },
    link: { color: '#000000' },
    text: { fontSize: 11, lineHeight: 1.4, color: '#000000', textAlign: 'justify' }
  });

  return (
    <View style={styles.page}>
      <View>
        <Text style={styles.name}>{personalInfo.fullName || 'Your Name'}</Text>
        <View style={styles.contactRow}>
          {personalInfo.email && <Text>{personalInfo.email}</Text>}
          {personalInfo.email && personalInfo.phone && <Text style={styles.separator}>|</Text>}
          {personalInfo.phone && <Text>{personalInfo.phone}</Text>}
          {personalInfo.phone && personalInfo.location && <Text style={styles.separator}>|</Text>}
          {personalInfo.location && <Text>{personalInfo.location}</Text>}
          {personalInfo.linkedIn && (
            <>
              <Text style={styles.separator}>|</Text>
              <Link src={personalInfo.linkedIn} style={styles.link}>LinkedIn</Link>
            </>
          )}
        </View>
      </View>

      {summary ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.text}>{summary}</Text>
        </View>
      ) : null}

      {experience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Experience</Text>
          {experience.map((exp, i) => (
            <View key={i} style={{ marginBottom: 10 }}>
              <View style={styles.row}>
                <View>
                  <Text style={styles.title}>{exp.role}</Text>
                  {exp.company && <Text style={styles.company}>{exp.company}</Text>}
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

      {education.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {education.map((edu, i) => (
            <View key={i} style={[styles.row, { marginBottom: 6 }]}>
              <View>
                <Text style={styles.title}>{edu.degree}{edu.field && ` in ${edu.field}`}</Text>
                {edu.institution && <Text style={styles.company}>{edu.institution}</Text>}
              </View>
              <Text style={styles.dates}>
                {edu.startDate}{edu.startDate && edu.endDate ? ' - ' : ''}{edu.endDate}
              </Text>
            </View>
          ))}
        </View>
      )}

      {(skills.technical.length > 0 || skills.soft.length > 0) && (
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
        </View>
      )}

      {projects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projects</Text>
          {projects.map((proj, i) => (
            <View key={i} style={{ marginBottom: 6 }}>
              <Text style={styles.title}>{proj.name}</Text>
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
    </View>
  );
}

export default StandardPdf;
