let isPaused = false;

function updateMinefieldFromDOM() {
  const section = document.querySelector('section[class*="minesweeper"]');  // Tìm section chứa class 'minesweeper'

  if (!section) {
    console.error('Không tìm thấy section nào có class chứa "minesweeper"');
    clickPlayAgainButton();
    return;
  }

  const cells = section.querySelectorAll('._field_1knt0_1');  // Tìm tất cả các ô bên trong section

  let rowIndex = 0;
  let colIndex = 0;

  // Duyệt qua tất cả các ô (cells) và cập nhật vào mảng minefield
  cells.forEach((cell, index) => {
    const img = cell.querySelector('img');  // Tìm thẻ img trong ô

    if (img) {
      // Kiểm tra class của img để xác định ô trống
      if (img.className.includes('emptyCell')) {
        minefield[rowIndex][colIndex] = 9;  // Đặt giá trị 9 cho ô đã mở và trống
      } else {
        // Nếu img không có class 'emptyCell', kiểm tra thuộc tính alt để xác định số trên ô
        const altText = img.getAttribute('alt');
        if (altText === 'Coin 1') {
          minefield[rowIndex][colIndex] = 1;
        } else if (altText === 'Coin 2') {
          minefield[rowIndex][colIndex] = 2;
        } else if (altText === 'Coin 3') {
          minefield[rowIndex][colIndex] = 3;
        } else if (altText === 'Coin 4') {
          minefield[rowIndex][colIndex] = 4;
        } else if (altText === 'Coin 5') {
          minefield[rowIndex][colIndex] = 5;
        }
      }
    } else {
      // Ô chưa mở
      minefield[rowIndex][colIndex] = 0;
    }

    colIndex++;
    if (colIndex >= 6) {  // Giả sử mỗi hàng có 6 ô
      colIndex = 0;
      rowIndex++;
    }
  });
}

function calculateMinefield(minefield) {
  const rows = minefield.length;
  const cols = minefield[0].length;

  // Hàm kiểm tra xem vị trí có nằm trong phạm vi của mảng không
  function isValid(row, col) {
    return row >= 0 && row < rows && col >= 0 && col < cols;
  }

  // Mảng chứa vị trí của các hướng xung quanh một ô
  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1],  // Trên, Dưới, Trái, Phải
    [-1, -1], [-1, 1], [1, -1], [1, 1]  // 4 góc
  ];

  // Khởi tạo mảng kết quả với các giá trị ban đầu từ minefield
  let result = minefield.map(row => row.slice());

  // Hàm quét qua minefield
  function sweepMinefield(startRow, startCol, rowInc, colInc) {
    for (let row = startRow; row >= 0 && row < rows; row += rowInc) {
      for (let col = startCol; col >= 0 && col < cols; col += colInc) {
        if (minefield[row][col] > 0 && minefield[row][col] <= 3) {
          // Nếu là ô chứa số (1, 2, 3), kiểm tra các ô xung quanh
          let adjacentEmpty = [];  // Danh sách các ô xung quanh có thể chứa bom hoặc an toàn
          let adjacentBombs = 0;   // Số lượng bom đã xác định
          let openedCount = 0;     // Đếm số ô đã mở xung quanh

          directions.forEach(([dr, dc]) => {
            const newRow = row + dr;
            const newCol = col + dc;
            if (isValid(newRow, newCol)) {
              if (result[newRow][newCol] === -1) {
                adjacentBombs++;  // Đã xác định là có bom
              } else if (result[newRow][newCol] === 0) {
                adjacentEmpty.push([newRow, newCol]);  // Các ô có thể có bom hoặc an toàn
              } else if (minefield[newRow][newCol] >= 1 && minefield[newRow][newCol] <= 9) {
                openedCount++;  // Đếm số ô đã mở
              }
            }
          });

          // Nếu số bom đã xác định + các ô trống xung quanh = số chỉ báo => Đánh dấu các ô trống là bom
          if (adjacentBombs + adjacentEmpty.length === minefield[row][col]) {
            adjacentEmpty.forEach(([newRow, newCol]) => {
              result[newRow][newCol] = -1;  // Xác định có bom
            });
          }
          // Nếu số bom đã xác định = số chỉ báo => Các ô trống còn lại là an toàn
          else if (adjacentBombs === minefield[row][col]) {
            adjacentEmpty.forEach(([newRow, newCol]) => {
              if (result[newRow][newCol] !== 9) {
                result[newRow][newCol] = 8;  // Xác định là an toàn nếu chưa mở
              }
            });
          }
        }
      }
    }
  }

  // Quét xuôi: từ trên xuống dưới, từ trái sang phải
  sweepMinefield(0, 0, 1, 1);

  // Quét ngược: từ dưới lên trên, từ phải sang trái
  sweepMinefield(rows - 1, cols - 1, -1, -1);

  return result;
}


// Mảng minefield ban đầu
function markCells(minefieldResult) {
  const section = document.querySelector('section[class*="minesweeper"]');  // Tìm section chứa class 'minesweeper'

  if (!section) {
    console.error('Không tìm thấy section nào có class chứa "minesweeper"');
    clickPlayAgainButton();
    return;
  }

  const cells = section.querySelectorAll('._field_1knt0_1');  // Tìm tất cả các ô trong bảng

  let rowIndex = 0;
  let colIndex = 0;

  // Duyệt qua tất cả các ô và thay đổi background-color
  cells.forEach((cell, index) => {
    const img = cell.querySelector('img');  // Tìm thẻ img trong ô

    // Nếu ô có class 'open', xóa backgroundColor
    if (cell.classList.contains('open')) {
      cell.style.backgroundColor = '';  // Xóa background-color nếu ô đã mở
    } else {
      if (img) img.src = 'https://cdn-icons-png.flaticon.com/512/679/679821.png';  // Xóa thẻ img nếu có
      // Nếu vị trí trong mảng result là 8, đổi background-color thành green (ô an toàn)
      if (minefieldResult[rowIndex][colIndex] === 8) {
        console.log(`Đánh dấu ô an toàn tại vị trí (${rowIndex}, ${colIndex})`);
        cell.style.backgroundColor = 'green';
        if (img) img.src = 'https://cdn-icons-png.flaticon.com/512/2302/2302157.png';  // Xóa thẻ img nếu có
      }
      // Nếu vị trí trong mảng result là -1, đổi background-color thành red (ô chứa bom)
      else if (minefieldResult[rowIndex][colIndex] === -1) {
        console.log(`Đánh dấu ô bom tại vị trí (${rowIndex}, ${colIndex})`);
        cell.style.backgroundColor = 'red';
        if (img) img.src = 'https://cdn-icons-png.flaticon.com/512/7445/7445281.png';  // Xóa thẻ img nếu có
      }
    }

    colIndex++;
    if (colIndex >= 6) {  // Giả sử mỗi hàng có 6 ô
      colIndex = 0;
      rowIndex++;
    }
  });
}

function clickCells(minefieldResult) {
  console.log(minefieldResult)
  console.log('clickCells')
  const section = document.querySelector('section[class*="minesweeper"]');  // Tìm section chứa class 'minesweeper'

  if (!section) {
    console.error('Không tìm thấy section nào có class chứa "minesweeper"');
    clickPlayAgainButton();
    return;
  }

  const cells = section.querySelectorAll('._field_1knt0_1');  // Tìm tất cả các ô trong bảng

  let rowIndex = 0;
  let colIndex = 0;
  let clicked = false;

  // Hàm xử lý click với thời gian dừng giữa các lần click
  function clickAndContinue(index) {
    if (index >= cells.length) {
      console.log('done');  // In ra 'done' khi hoàn thành tất cả các ô
      if (!clicked) {
        // Nếu không có ô nào được click, chọn ngẫu nhiên một ô có giá trị 0
        clickRandomCellWithZero(minefieldResult);
      }
      checkDone = true;
      return;
    }

    const cell = cells[index];
    const img = cell.querySelector('img');  // Tìm thẻ img trong ô

    // Nếu ô có class 'open', xóa backgroundColor
    if (cell.classList.contains('open')) {
      colIndex++;
      if (colIndex >= 6) {  // Giả sử mỗi hàng có 6 ô
        colIndex = 0;
        rowIndex++;
      }
      proceedToNextCell(index + 1);
    } else {
      // Nếu vị trí trong mảng result là 8, đổi background-color thành green (ô an toàn)
      if (minefieldResult[rowIndex][colIndex] === 8) {

        // Tạo logic để click vào ô an toàn dựa trên vị trí
        const cellSelector = `#root > section > div:nth-child(${index + 2})`; // Thêm 2 vào chỉ số
        const cellToClick = document.querySelector(cellSelector);
        if (cellToClick) {
          cellToClick.click();
        } else {
          console.warn(`Không tìm thấy ô để click tại vị trí: ${cellSelector}`);
        }
      }
      colIndex++;
      if (colIndex >= 6) {  // Giả sử mỗi hàng có 6 ô
        colIndex = 0;
        rowIndex++;
      }
      // Gọi tiếp hàm sau 1 giây để tiếp tục xử lý các ô tiếp theo
      setTimeout(() => proceedToNextCell(index + 1), 500);
    }


  }
  function proceedToNextCell(nextIndex) {
    clickAndContinue(nextIndex);
  }
  // Hàm để chọn ngẫu nhiên một ô có giá trị 0
  function clickRandomCellWithZero(minefieldResult) {
    console.log('click random start logic')
    minefield = Array(9).fill(0).map(() => Array(6).fill(0));
    // Gọi hàm để cập nhật mảng minefield từ giao diện mỗi khi cần cập nhật lại
    updateMinefieldFromDOM();

    // Tính toán vị trí bom và vị trí an toàn
    let result = calculateMinefield(minefield);

    // In ra mảng kết quả để kiểm tra
    console.log(result);

    // Thay đổi background-color cho các ô an toàn và bom
    markCells(result);
    setTimeout(1000);
    let zeroCells = [];
    result.forEach((row, rIdx) => {
      row.forEach((value, cIdx) => {
        if (value === 8) {
          zeroCells = [];
          zeroCells.push({ row: rIdx, col: cIdx });
          return;
        }
        if (value === 0) {
          zeroCells.push({ row: rIdx, col: cIdx });
        }
      });
    });

    if (zeroCells.length > 0) {
      const randomCell = zeroCells[Math.floor(Math.random() * zeroCells.length)];
      const cellIndex = randomCell.row * 6 + randomCell.col; // Tính toán index của ô trong DOM
      const cellSelector = `#root > section > div:nth-child(${cellIndex + 2})`; // Thêm 2 vào chỉ số
      const cellToClick = document.querySelector(cellSelector);
      checkDone = true;
      if (cellToClick) {
        console.log(`Click ngẫu nhiên vào ô tại vị trí (${randomCell.row}, ${randomCell.col})`);
        cellToClick.click();
      } else {
        console.warn(`Không tìm thấy ô để click tại vị trí: ${cellSelector}`);
      }
    }
  }

  // Bắt đầu xử lý từ ô đầu tiên
  clickAndContinue(0);
}

function clickPlayAgainButton() {
  console.log('clickPlayAgainButton')
  // Tìm tất cả các nút trong trang
  const buttons = document.querySelectorAll('button');

  // Duyệt qua các nút để tìm nút có text là "Play Again"
  buttons.forEach((button) => {
    if (button.textContent.trim() === 'Play Again') {
      console.log('Tìm thấy nút Play Again, thực hiện click.');
      button.click();  // Thực hiện click vào nút "Play Again"
      isPaused = true;  // Đặt cờ tạm dừng thành true để ngăn monitorProcess chạy tiếp

      setTimeout(() => {
        document.querySelector("#root > section > div:nth-child(28)").click();

        console.log("Tạm dừng 60 giây trước khi chạy tiếp...");
        setTimeout(() => {
          console.log("Tiếp tục sau 60 giây.");
          checkDone = true;
          isPaused = false;
        }, 60000);
      }, 2000);  // Tạm dừng 2 giây để click vào ô tiếp theo sau khi bắt đầu lại trò chơi
    }
  });
}

// Mảng minefield ban đầu
let minefield = Array(9).fill(0).map(() => Array(6).fill(0));
let checkDone = false;
function processMinefield() {
  console.log('processMinefield')
  minefield = Array(9).fill(0).map(() => Array(6).fill(0));
  // Gọi hàm để cập nhật mảng minefield từ giao diện mỗi khi cần cập nhật lại
  updateMinefieldFromDOM();

  // Tính toán vị trí bom và vị trí an toàn
  let result = calculateMinefield(minefield);

  // In ra mảng kết quả để kiểm tra
  console.log(result);

  // Thay đổi background-color cho các ô an toàn và bom
  markCells(result);

  // Thực hiện click vào các ô an toàn và sau khi hoàn thành thì gọi lại processMinefield để lặp lại
  checkDone = false;

  // Thực hiện click vào các ô an toàn và sau khi hoàn thành thì đặt checkDone = true
  clickCells(result, () => {
    checkDone = true;  // Đánh dấu rằng quá trình đã hoàn tất
  });
}
function monitorProcess() {
  if (isPaused) {
    console.log('Đang tạm dừng, không kiểm tra processMinefield.');
    return;  // Nếu đang tạm dừng, thoát khỏi hàm mà không làm gì
  }

  console.log('checkDone:  ' + checkDone);
  if (checkDone) {
    console.log('Bắt đầu lại processMinefield sau khi hoàn tất.');
    processMinefield();  // Chạy lại processMinefield khi checkDone = true
  }
}

processMinefield();

setInterval(monitorProcess, 900);

function checkAndRestart() {
  // Lấy nội dung của thời gian từ phần tử span
  const timeText = document.querySelector("#root > div._optionsContainer_8x83b_1 > div._timerMineContainer_8x83b_9 > div._timerContainer_gnt2b_1 > span").textContent;
  const [minutes, seconds] = timeText.split(':').map(Number);

  // Kiểm tra nếu phút > 10
  if (minutes > 10) {
      const restartButton = document.querySelector("#root > div._optionsContainer_8x83b_1 > button._restartButton_c6be8_1.button-blue-opacity");
      if (restartButton) {
          restartButton.click();
          document.querySelector("#root > section > div:nth-child(28)").click();
      }
  }
}

// Chạy hàm kiểm tra và nhấp vào nút mỗi phút (60000 ms)
setInterval(checkAndRestart, 60000);
