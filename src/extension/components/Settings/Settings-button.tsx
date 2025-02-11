import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faCaretDown, faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import "../../styles/dependency-plugin.css";
import { getDependencyViewConfig } from "../DependencyView";
import SettingsService from "@src/services/SettingsService";
import { ISettingsData } from "@src/models/SettingsData";

const settingsService = new SettingsService();

interface SettingsButtonProps {
  mainClass: string;
  setMainClass: React.Dispatch<React.SetStateAction<string>>;
  mainMethod: string;
  setMainMethod: React.Dispatch<React.SetStateAction<string>>;
  baseClass: string;
  setBaseClass: React.Dispatch<React.SetStateAction<string>>;
}

const SettingsButton: React.FC<SettingsButtonProps> = ({
  mainClass,
  setMainClass,
  mainMethod,
  setMainMethod,
  baseClass,
  setBaseClass
}) => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const changeDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  const saveSettings = async () => {
    const { owner, repository, pull_number } = getDependencyViewConfig();

    const settingsData: ISettingsData = {
      uuid: crypto.randomUUID(),
      owner,
      repository,
      pull_number,
      mainClass,
      mainMethod
    };

    if (baseClass !== "") settingsData.baseClass = baseClass;
    if (mainClass === "") settingsData.mainClass = "org.example.Main";
    if (mainMethod === "") settingsData.mainMethod = "main";

    try {
      const success = await settingsService.saveSettings(owner, repository, pull_number, settingsData);
      if (success) {
        console.log("Settings saved successfully");
      } else {
        console.error("Error saving settings");
      }
    } catch (error) {
      console.error("Error during request:", error);
    }
  };

  return (
    <div id="dependency-plugin-header" className="settings-container tw-mb-3">
      <button className="settings-button" onClick={changeDropdown}>
        <FontAwesomeIcon icon={faGear} />
        <FontAwesomeIcon icon={faCaretDown} />
      </button>
      {isDropdownVisible && (
        <div className="dropdown-settings">
          <div className="form-group">
            <label className="settings-label" htmlFor="base-class">
              Main Class
            </label>
            <span className="tooltip-container">
              <FontAwesomeIcon icon={faCircleQuestion} className="question-icon" />
              <div className="tooltip">
                The analysis will search for conflicts in all methods that can be reached from the set method
                the Main Class. If none is set, the default org.example.Main.main() will be used.
                <br />
                Setting this to a method that covers more of the codebase will result in a more comprehensive
                analysis, but it will also take longer to complete.
              </div>
            </span>
            <input
              className="settings-input"
              id="main-class"
              type="text"
              placeholder="Enter Main class"
              value={mainClass}
              onChange={(e) => setMainClass(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="settings-label" htmlFor="main-method">
              Main Method
            </label>
            <span className="tooltip-container">
              <FontAwesomeIcon icon={faCircleQuestion} className="question-icon" />
              <div className="tooltip">That will be the main method analysed through the Main Class.</div>
            </span>
            <input
              className="settings-input"
              id="main-method"
              type="text"
              placeholder="Enter main method"
              value={mainMethod}
              onChange={(e) => setMainMethod(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="settings-label" htmlFor="base-class">
              Base Class
            </label>
            <span className="tooltip-container">
              <FontAwesomeIcon icon={faCircleQuestion} className="question-icon" />
              <div className="tooltip">
                Only conflicts in methods that can be reached from the base class will be reported. If a
                conflict outside of this scope exists, it will be ignored.
                <br />
                Defining a base class can help to guide the analysis to the most relevant parts of the
                codebase.
              </div>
            </span>
            <input
              className="settings-input"
              id="base-class"
              type="text"
              placeholder="Enter base class"
              value={baseClass}
              onChange={(e) => setBaseClass(e.target.value)}
            />
          </div>
          <button onClick={saveSettings}>Save Settings</button>
        </div>
      )}
    </div>
  );
};

export default SettingsButton;
