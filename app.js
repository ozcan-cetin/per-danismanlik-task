const apiUrl = "https://yahoo-finance15.p.rapidapi.com/api/v2/markets/tickers";
const options = {
  method: "GET",
  params: {
    type: "STOCKS",
    page: "1",
  },
  headers: {
    "X-RapidAPI-Key": "104bed7ae9mshdca292bcafd9fbfp1acf67jsn141a0cf93a93",
    "X-RapidAPI-Host": "yahoo-finance15.p.rapidapi.com",
  },
};

axios
  .get(apiUrl, options)
  .then((response) => {
    const data = response.data.body;
    populateTable(data);
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });

function getRandomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function populateTable(data) {
  const tableBody = document.querySelector("#dataTable tbody");
  data.forEach((item) => {
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    const dateCell = document.createElement("td");
    const priceCell = document.createElement("td");

    const randomDate = getRandomDate(
      new Date(2023, 0, 1),
      new Date(2024, 0, 1)
    );

    const price = parseFloat(item.lastsale.replace(/[$,]/g, ""));
    const formattedPrice = new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(price);

    nameCell.textContent = item.name;
    dateCell.textContent = randomDate.toLocaleDateString("tr-TR");
    dateCell.dataset.timestamp = randomDate.getTime();
    priceCell.textContent = formattedPrice;

    row.appendChild(nameCell);
    row.appendChild(dateCell);
    row.appendChild(priceCell);

    tableBody.appendChild(row);
  });
}

document.querySelector("#searchInput").addEventListener("input", function () {
  const filter = this.value.toLowerCase();
  const rows = document.querySelectorAll("#dataTable tbody tr");

  rows.forEach((row) => {
    const cells = row.getElementsByTagName("td");
    let match = false;
    for (let i = 0; i < cells.length; i++) {
      if (cells[i].textContent.toLowerCase().includes(filter)) {
        match = true;
        break;
      }
    }
    if (match) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
});

function exportToExcel() {
  const table = document.getElementById("dataTable");
  const workbook = XLSX.utils.table_to_book(table);
  XLSX.writeFile(workbook, "data.xlsx");
}

function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const table = document.getElementById("dataTable");
  const headers = Array.from(table.querySelectorAll("thead th")).map(
    (th) => th.innerText
  );
  const rows = Array.from(table.querySelectorAll("tbody tr")).map((tr) =>
    Array.from(tr.querySelectorAll("td")).map((td) => td.innerText)
  );

  doc.autoTable({
    head: [headers],
    body: rows,
  });

  doc.save("data.pdf");
}

document.getElementById("exportExcel").addEventListener("click", exportToExcel);
document.getElementById("exportPDF").addEventListener("click", exportToPDF);

document.querySelectorAll("#dataTable th").forEach((header, index) => {
  header.addEventListener("click", () => {
    const currentIsAscending = header.getAttribute("data-sort") === "asc";
    const newIsAscending = !currentIsAscending;
    header.setAttribute("data-sort", newIsAscending ? "asc" : "desc");
    sortTableByColumn(index, newIsAscending);
  });
});

function sortTableByColumn(columnIndex, ascending) {
  const table = document.getElementById("dataTable");
  const rows = Array.from(table.rows).slice(1);
  const sortedRows = rows.sort((a, b) => {
    const aText = a.cells[columnIndex].textContent;
    const bText = b.cells[columnIndex].textContent;

    if (columnIndex === 1) {
      const aDate = new Date(parseInt(a.cells[columnIndex].dataset.timestamp));
      const bDate = new Date(parseInt(b.cells[columnIndex].dataset.timestamp));
      return ascending ? aDate - bDate : bDate - aDate;
    }

    return ascending
      ? aText.localeCompare(bText, "tr", { numeric: true })
      : bText.localeCompare(aText, "tr", { numeric: true });
  });

  sortedRows.forEach((row) => table.tBodies[0].appendChild(row));
}

document
  .querySelectorAll('#columnToggle input[type="checkbox"]')
  .forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      const column = this.dataset.column;
      const isChecked = this.checked;
      toggleColumnVisibility(column, isChecked);
    });
  });

function toggleColumnVisibility(columnIndex, isVisible) {
  const table = document.getElementById("dataTable");
  const cells = table.querySelectorAll(
    `th:nth-child(${Number(columnIndex) + 1}), td:nth-child(${
      Number(columnIndex) + 1
    })`
  );
  cells.forEach((cell) => {
    cell.style.display = isVisible ? "" : "none";
  });
}
