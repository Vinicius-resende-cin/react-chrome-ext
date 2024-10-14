// insertButtons.ts
export const insertButtons = (diffFile: HTMLElement, expandTop: Function, expandBottom: Function) => {
    const lines = diffFile.querySelectorAll("tr");
    let firstVisibleIndex = -1;
    let lastVisibleIndex = -1;
    let previousLineNumber = -1;
  
    // Loop through lines and find visible lines
    lines.forEach((line, index) => {
      const lineNumberElementOne = line.querySelector('.line-num1');
      const lineNumberOne = lineNumberElementOne ? parseInt(lineNumberElementOne.textContent || '', 10) : null;

      const lineNumberElementTwo = line.querySelector('.line-num2');
      const lineNumberTwo = lineNumberElementTwo ? parseInt(lineNumberElementTwo.textContent || '', 10) : null;
      
      if ((lineNumberOne !== null || lineNumberTwo !== null) && !line.classList.contains('d2h-d-none')) {
        // Detect the first visible line
        if (firstVisibleIndex === -1) {
          firstVisibleIndex = index;
  
          // Insert "expand up" button before the first visible line
          const topButtonContainer = document.createElement("div");
          topButtonContainer.classList.add("button-container", "button-top");
          const topButton = document.createElement("button");
          topButton.innerHTML = "&#x25B2;";
          topButton.classList.add("button-style");
          topButton.onclick = () => expandTop(diffFile, index);
          topButton.title = "Expand Up";
          topButtonContainer.appendChild(topButton);
          line.insertAdjacentElement("beforebegin", topButtonContainer);
        }
  
        // Detect out of order lines and insert "expand bottom" and "expand up" accordingly
        if (previousLineNumber !== -1){
          const outOfOrder = (lineNumberOne !== null && lineNumberOne > previousLineNumber + 1) || (lineNumberTwo !== null && lineNumberTwo > previousLineNumber + 1);

          if (outOfOrder) {

            const currentLastVisibleIndex = lastVisibleIndex;

            // Insert "expand bottom" after previous line
            const bottomButtonContainer = document.createElement("div");
            bottomButtonContainer.classList.add("button-container", "button-down");
            const bottomButton = document.createElement("button");
            bottomButton.innerHTML = "&#x25BC;";
            bottomButton.classList.add("button-style");
            bottomButton.onclick = () => expandBottom(diffFile, currentLastVisibleIndex);
            bottomButton.title = "Expand Down";
            bottomButtonContainer.appendChild(bottomButton);
            lines[lastVisibleIndex].insertAdjacentElement("afterend", bottomButtonContainer);
    
            // Insert "expand up" before current out-of-order line
            const newTopButtonContainer = document.createElement("div");
            newTopButtonContainer.classList.add("button-container", "button-top");
            const newTopButton = document.createElement("button");
            newTopButton.innerHTML = "&#x25B2;";
            newTopButton.classList.add("button-style");
            newTopButton.onclick = () => expandTop(diffFile, index);
            newTopButton.title = "Expand Up";
            newTopButtonContainer.appendChild(newTopButton);
            line.insertAdjacentElement("beforebegin", newTopButtonContainer);
          }
    
        } 
        
        previousLineNumber = Math.max(lineNumberOne ?? -1, lineNumberTwo ?? -1);
        lastVisibleIndex = index;
      }
    });
  
    // Insert "expand bottom" after the last visible line
    if (lastVisibleIndex !== -1) {
      const bottomButtonContainer = document.createElement("div");
      bottomButtonContainer.classList.add("button-container", "button-down");
      const bottomButton = document.createElement("button");
      bottomButton.innerHTML = "&#x25BC;";
      bottomButton.classList.add("button-style");
      bottomButton.onclick = () => expandBottom(diffFile, lastVisibleIndex);
      bottomButton.title = "Expand Down";
      bottomButtonContainer.appendChild(bottomButton);
      lines[lastVisibleIndex].insertAdjacentElement("afterend", bottomButtonContainer);
    }
  };
  