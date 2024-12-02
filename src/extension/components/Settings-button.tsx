import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faCaretDown, faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import "../styles/dependency-plugin.css";

const SettingsButton = () => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const changeDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
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
            <input className="settings-input" id="base-class" type="text" placeholder="Enter base class" />
          </div>
          <div className="form-group">
            <label className="settings-label" htmlFor="main-method">Main Method</label>
            <span className="tooltip-container">
                <FontAwesomeIcon icon={faCircleQuestion} className="question-icon" />
                <div className="tooltip">That will be the main method analysed through the Base Class.</div>
            </span>
            <input className="settings-input" id="main-method" type="text" placeholder="Enter main method" />
          </div>
        </div>
      )}
      </div>
  );
};

export default SettingsButton;
