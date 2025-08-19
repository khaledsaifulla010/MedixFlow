"use client";

import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

export type Medicine = {
  name: string;
  type: string;
  dosage: string;
  dosageTime: string;
  duration: string;
};

export type PrescriptionData = {
  doctor: {
    name: string;
    degree: string;
    speciality: string;
    email: string;
    mobile: string;
  };
  clinic: {
    name: string;
    address: string;
    phone: string;
    timing: string;
    closed: string;
    logoUrl?: string;
  };
  patient: {
    name: string;
    phone: string;
    email: string;
  };
  date?: string;
  medicines: Medicine[];
  advice: string[];
  followUp: string;
};
const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 11, fontFamily: "Helvetica", color: "#111" },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: { width: "40%" },
  headerCenter: { width: "20%", alignItems: "center" },
  headerRight: { width: "40%", textAlign: "right" },
  docName: { fontSize: 12, fontWeight: "bold" },
  clinicName: { fontSize: 12, fontWeight: "bold" },
  logo: { width: 56, height: 56, objectFit: "contain" },

  hr: { height: 1, backgroundColor: "#000", marginBottom: 10, marginTop: 10 },

  patientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  patientText: {
    fontWeight: "bold",
  },
  patientBlock: { gap: 2 },

  table: {
    borderWidth: 1,
    borderColor: "#000",
    marginTop: 6,
    borderRadius: 4,
  },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#000" },
  th: {
    flex: 1,
    padding: 6,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "#f3f3f3",
  },
  td: { flex: 1, padding: 6, textAlign: "center" },
  thSmall: {
    flex: 0.6,
    padding: 6,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "#f3f3f3",
  },
  tdSmall: { flex: 0.6, padding: 6, textAlign: "center" },

  sectionTitle: { fontSize: 14, fontWeight: "bold", marginTop: 8 },

  adviceLine: {
    textAlign: "justify",
    marginBottom: 8,
    fontSize: 12,
  },
  adviceBorder: {
    borderWidth: 1,
    borderColor: "#000",
    minHeight: 120,
    marginTop: 4,
    marginBottom: 20,
    borderRadius: 4,
    padding: 10,
  },
  footerSignWrap: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 220,
    alignItems: "flex-end",
  },
  signLine: {
    width: "100%",
    borderTopWidth: 1,
    borderColor: "#000",
    marginTop: 4,
    marginBottom: 2,
  },
  signText: { fontSize: 12, marginRight: "80px" },
  signatureName: {
    fontSize: 10,
    fontWeight: "bold",
    marginRight: "60px",
  },
});

const strictNow = () => {
  const d = new Date();
  const dd = d.getDate().toString().padStart(2, "0");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const mon = months[d.getMonth()];
  const yyyy = d.getFullYear();
  let hh = d.getHours();
  const ampm = hh >= 12 ? "PM" : "AM";
  hh = hh % 12 || 12;
  const mm = d.getMinutes().toString().padStart(2, "0");
  return `${dd} ${mon} ${yyyy}, Time : ${hh}:${mm} ${ampm}`;
};
export default function PrescriptionPDF({ data }: { data: PrescriptionData }) {
  const dateStr = data.date || strictNow();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.docName}>{data.doctor.name}</Text>
            <Text>{data.doctor.degree}</Text>
            <Text>Mobile No: {data.doctor.mobile}</Text>
            <Text>Email: {data.doctor.email}</Text>
          </View>

          <View style={styles.headerCenter}>
            {data.clinic.logoUrl ? (
              <Image style={styles.logo} src={data.clinic.logoUrl} />
            ) : (
              <View style={[styles.logo, { borderWidth: 1 }]} />
            )}
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.clinicName}>{data.clinic.name}</Text>
            <Text>{data.clinic.address}</Text>
            <Text>Ph: {data.clinic.phone}</Text>
            <Text>Timing: {data.clinic.timing}</Text>
            <Text>Closed: {data.clinic.closed}</Text>
          </View>
        </View>

        <View style={styles.hr} />

        <View style={styles.patientRow}>
          <View style={styles.patientBlock}>
            <Text style={styles.patientText}>
              Patient Name : {data.patient.name}
            </Text>
            <Text style={styles.patientText}>
              Mobile No : {data.patient.phone}
            </Text>
            <Text style={styles.patientText}>Email : {data.patient.email}</Text>
          </View>
          <Text style={styles.patientText}>Date : {dateStr}</Text>
        </View>

        <View style={styles.hr} />

        <Text style={styles.sectionTitle}>Suggested Medicines</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.thSmall}>SL/No.</Text>
            <Text style={styles.th}>Type</Text>
            <Text style={styles.th}>Name</Text>
            <Text style={styles.th}>Dosage</Text>
            <Text style={styles.th}>Dosage Time</Text>
            <Text style={styles.th}>Duration</Text>
          </View>

          {data.medicines.map((m, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.tdSmall}>{i + 1}</Text>
              <Text style={styles.td}>{m.type}</Text>
              <Text style={styles.td}>{m.name}</Text>
              <Text style={styles.td}>{m.dosage}</Text>
              <Text style={styles.td}>{m.dosageTime}</Text>
              <Text style={styles.td}>{m.duration}</Text>
            </View>
          ))}
        </View>

        <View style={styles.hr} />

        <Text style={styles.sectionTitle}>Advice</Text>
        <View style={styles.adviceBorder}>
          {data.advice.map((line, idx) => (
            <Text key={idx} style={styles.adviceLine}>
              {line}
            </Text>
          ))}
        </View>
        <Text style={styles.sectionTitle}>Follow Up Time: {data.followUp}</Text>

        <View style={styles.footerSignWrap}>
          <Text
            style={[
              styles.signatureName,
              {
                fontFamily: "Courier-BoldOblique",
                fontSize: 12,
              },
            ]}
          >
            {data.doctor.name}
          </Text>
          <View style={styles.signLine} />
          <Text style={styles.signText}>Signature</Text>
        </View>
      </Page>
    </Document>
  );
}
