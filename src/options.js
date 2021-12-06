const rowTemplate = document.getElementById("table-row-template");
const table = document.getElementById("table-body");

document.getElementById("add-row").addEventListener("click", addTableRow);
document.getElementById("save-options").addEventListener("click", saveOptions);

loadOptions();

function saveOptions() {
  const options = tableToObject();
  chrome.storage.sync.set({ opts: options }, function() {
    var status = document.getElementById('save-status');
    status.textContent = 'Options saved';
    setTimeout(function() {
      status.textContent = '';
    }, 1500);
  });
}

function tableToObject() {
  const or = (a, b) => a !== undefined && a !== '' ? a
                     : b !== undefined && b !== '' ? b
                     : undefined;
  const arrayTable = [...table.rows].reduce( (acc, row) => [ ...acc, [...row.cells].slice(1, -1).map(x => x.firstChild.value), ], [] );
  return arrayTable.reduce((acc, row) => {
    return {
      ...acc,
      [or(row[1], row[2])]: {
        baseUnit: row[0],
        actualUnit: row[1] || row[2],
        shortFor: row[2] || row[1],
        plural: row[3],
        factor: row[4] || 1,
        offset: row[5] || 0,
      },
    };
  }, {});
}

function addTableRow(row = {}) {
  const newRow = rowTemplate.content.cloneNode(true);
  const deleteRowButton = newRow.querySelector(".delete-row");
  deleteRowButton.addEventListener("click", () => {
    table.removeChild(deleteRowButton.parentNode.parentNode);
  });
  table.appendChild(newRow);

  const setCell = (idx, value) => table.rows[table.rows.length - 1].cells[idx].firstChild.value = value || '';
  setCell(1, row.baseUnit);
  setCell(2, row.actualUnit);
  setCell(3, row.shortFor);
  setCell(4, row.plural === 'on');
  setCell(5, row.factor);
  setCell(6, row.offset);
}

function loadOptions(defaultOptions = undefined) {
  chrome.storage.sync.get("opts", (data) => {
    const options = data.opts || defaultOptions || { };
    console.log(options);
    for (let key of Object.keys(options)) {
      console.log(options[key]);
      addTableRow(options[key])
    }
  });
}
