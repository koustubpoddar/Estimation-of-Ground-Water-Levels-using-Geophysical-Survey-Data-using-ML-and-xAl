document.getElementById("csv-form").addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent default form submission

  let fileInput = document.getElementById("csv-file");
  let file = fileInput.files[0];

  if (!file) {
      alert("Please upload your file before analyzing!");
      return;
  }

  // Check if the file is a valid CSV (using MIME type and extension)
  if (file.type !== "text/csv" && !file.name.toLowerCase().endsWith(".csv")) {
      alert("Only CSV files are allowed!");
      return;
  }

  let reader = new FileReader();
  reader.readAsText(file);

  reader.onload = function (e) {
      try {
          let csvContent = e.target.result.trim(); // Trim to remove empty lines at start/end
          let rows = csvContent.split("\n").map(row => row.split(",").map(cell => cell.trim()));

          if (rows.length < 2) { // Ensure file is not empty
              alert("CSV file is empty or incorrectly formatted!");
              return;
          }

          let headers = rows[0].map(header => header.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase()); // Normalize headers

          // Required column names (ensure they are formatted correctly)
          let requiredColumns = ["elec_pos", "depth", "rho", "cond"];

          // Check if the CSV has exactly 4 columns
          if (headers.length !== 4) {
              alert("Please ensure your CSV file has numerical data for electrode position, depth, conductivity, and resistivity!");
              return;
          }

          // Check if CSV contains the required columns (ignoring case sensitivity)
          if (!requiredColumns.every(col => headers.includes(col))) {
              alert("Please ensure your CSV file has numerical data for electrode position, depth, conductivity, and resistivity!");
              return;
          }

          // Check if all values in the dataset are numerical (excluding headers)
          for (let i = 1; i < rows.length; i++) {
              for (let j = 0; j < rows[i].length; j++) {
                  if (isNaN(rows[i][j]) || rows[i][j].trim() === "") {
                      alert("Please ensure your CSV file has numerical data for electrode position, depth, conductivity, and resistivity!");
                      return;
                  }
              }
          }

          // If everything is fine, submit the form
          document.getElementById("csv-form").submit();
      } catch (error) {
          alert("Error processing the CSV file. Please check its format and try again.");
      }
  };

  reader.onerror = function () {
      alert("Error reading the file. Please try again.");
  };
});
