import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faCaretDown, faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import "../../styles/dependency-plugin.css";
import { getDependencyViewConfig } from "../DependencyView"; 

const SettingsButton = () => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [baseClass, setBaseClass] = useState("");
  const [mainMethod, setMainMethod] = useState("");

  const changeDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  const saveSettings = async () => {
    const { owner, repository, pull_number } = getDependencyViewConfig();

    const settingsData = {
      uuid: crypto.randomUUID(),
      owner,
      repository,
      pull_number,
      baseClass,
      mainMethod,
    };

    try {
      const response = await fetch("http://localhost:4000/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: settingsData, 
        }),
      });

      if (response.ok) {
        console.log("Settings succesfully saved!");
      } else {
        console.error("Error at saving settings.");
      }
    } catch (error) {
      console.error("Erro at request:", error);
    }
  };

  return (
    <div id="dependency-plugin-header" className="settings-container tw-mb-3">
        <button className="settings-button" onClick={changeDropdown}>
          <FontAwesomeIcon icon={faGear}/>
          <FontAwesomeIcon icon={faCaretDown} />
        </button>
        {isDropdownVisible && (
        <div className="dropdown-settings">
          <div className="form-group">
            <label className="settings-label" htmlFor="base-class">Base Class</label>
            <span className="tooltip-container">
                <FontAwesomeIcon icon={faCircleQuestion} className="question-icon" />
                <div className="tooltip">The analysis will search for conflicts in all methods that can be reached from the set method from the base class. If none is set, the default org.example.Main.main() will be used.</div>
            </span>
            <input className="settings-input" id="base-class" type="text" placeholder="Enter base class" value={baseClass} onChange={(e) => setBaseClass(e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="settings-label" htmlFor="main-method">Main Method</label>
            <span className="tooltip-container">
                <FontAwesomeIcon icon={faCircleQuestion} className="question-icon" />
                <div className="tooltip">That will be the main method analysed through the Base Class.</div>
            </span>
            <input className="settings-input" id="main-method" type="text" placeholder="Enter main method" value={mainMethod} onChange={(e) => setMainMethod(e.target.value)}/>
          </div>
          <button onClick={saveSettings}>
            Save Settings
          </button>
        </div>
      )}
      </div>
  );
};

export default SettingsButton;
