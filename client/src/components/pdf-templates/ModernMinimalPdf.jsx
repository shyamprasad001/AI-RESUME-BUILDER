import { View, Text, Link, StyleSheet } from '@react-pdf/renderer';

function ModernMinimalPdf({ sections, colors, targetRole }) {
  const { personalInfo, summary, experience, education, skills, projects, certifications } = sections;

  const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica', color: '#262626', fontSize: 10, lineHeight: 1.5 },
    header: { marginBottom: 20 },
    name: { fontSize: 20, color: '#171717', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 2 },
    contactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, fontSize: 8, color: '#737373', textTransform: 'uppercase', letterSpacing: 1 },
    sectionTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 2, color: '#525252', paddingBottom: 6, marginBottom: 12, marginTop: 20 },
    section: { marginBottom: 12 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 },
    title: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#171717' },
    subtitle: { fontSize: 11, color: '#525252' },
    dates: { fontSize: 9, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: 1 },
    bulletItem: { flexDirection: 'row', marginLeft: 16, marginTop: 4 },
    bulletDot: { width: 8, fontSize: 10 },
    bulletText: { flex: 1, fontSize: 10, lineHeight: 1.6, color: '#404040', textAlign: 'justify' },
    skillLine: { fontSize: 10, marginTop: 4, color: '#404040', textAlign: 'justify' },
    bold: { fontFamily: 'Helvetica-Bold' },
    text: { fontSize: 10, lineHeight: 1.6, color: '#404040', textAlign: 'justify' }
  });

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.name}>{personalInfo.fullName || 'Your Name'}</Text>
        <View style={styles.contactRow}>
          {personalInfo.email && <Text>{personalInfo.email}</Text>}
          {personalInfo.phone && <Text>{personalInfo.phone}</Text>}
          {personalInfo.location && <Text>{personalInfo.location}</Text>}
          {personalInfo.linkedIn && <Text>{personalInfo.linkedIn}</Text>}
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
          <Text style={styles.sectionTitle}>Experience</Text>
          {experience.map((exp, i) => (
            <View key={i} style={{ marginBottom: 12 }}>
              <View style={styles.row}>
                <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
                  <Text style={styles.title}>{exp.role}</Text>
                  {exp.company && <Text style={styles.subtitle}> / {exp.company}</Text>}
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
            <View key={i} style={[styles.row, { marginBottom: 8 }]}>
              <View style={{ flexDirection: 'row', flex: 1, flexWrap: 'wrap' }}>
                <Text style={styles.title}>{edu.degree}{edu.field && ` - ${edu.field}`}</Text>
                {edu.institution && <Text style={styles.subtitle}> / {edu.institution}</Text>}
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
              <Text style={styles.bold}>Tech: </Text>
              {skills.technical.join(' • ')}
            </Text>
          )}
          {skills.soft.length > 0 && (
            <Text style={styles.skillLine}>
              <Text style={styles.bold}>Soft: </Text>
              {skills.soft.join(' • ')}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

export default ModernMinimalPdf;
