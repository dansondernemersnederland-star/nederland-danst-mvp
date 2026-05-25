export async function findMemberByNumberAndEmail(
  memberNumber: string,
  email: string
) {
  const csvUrl =
    process.env.NEXT_PUBLIC_GOOGLE_SHEET_CSV_URL || "";

  const response = await fetch(csvUrl, {
    cache: "no-store",
  });

  const csvText = await response.text();

  const rows = csvText
    .trim()
    .split("\n")
    .map((row) =>
      row.split(",").map((cell) => cell.trim())
    );

  const headers = rows[0];
  const dataRows = rows.slice(1);

  const members = dataRows.map((row) => {
    const item: any = {};

    headers.forEach((header, index) => {
      item[header] = row[index];
    });

    return item;
  });

  return members.find(
    (member: any) =>
      member.lidnummer?.toLowerCase() ===
        memberNumber.toLowerCase() &&
      member.email?.toLowerCase() ===
        email.toLowerCase() &&
      member.status?.toLowerCase() === "active"
  );
}