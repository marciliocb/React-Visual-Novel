// Dependencies
import React, { Component } from "react";
import Sound from "react-sound";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";
// API
import novelFrames from "./api/novelFrames";
import Choices from "./api/Choices";
// Components
import TitleScreen from "./components/TitleScreen";
import ChoiceMenu from "./components/ChoiceMenu";
import RenderFrame from "./components/RenderFrame";
import MenuButtons from "./components/MenuButtons";
import SaveLoadMenu from "./components/SaveLoadMenu";
// CSS
import "./styles/container.css";
import "./styles/sprites.css";
import "./styles/animations.css";
import "./styles/backlog.css";
import "./styles/choicesoverlay.css";
import "./styles/menubuttons.css";
import "./styles/saveloadmenu.css";
import "./styles/sprites.css";
import "./styles/textbox.css";
import "./styles/titlescreen.css";

const INITIAL_STATE = {
  choicesStore: {},
  index: 0,
  buttonsDeleted: false,
  choicesExist: false,
  titleScreenShown: true,
  frameIsRendering: false,
  menuButtonsShown: true,
  backlogShown: false,
  textBoxShown: true,
  saveMenuShown: false,
  loadMenuShown: false,
  isSkipping: false,
  indexHistory: []
};

class App extends Component {
  constructor() {
    super(); //constructor init

    this.state = INITIAL_STATE;
  }

  setFrameFromChoice(choice, jumpToBecauseChoice) {
    for (let i = 0; i < novelFrames.length; i++) {
      if (jumpToBecauseChoice === novelFrames[i].routeBegins) {
        this.setFrame(i);
      }
    }

    let choicesStore = Object.assign({}, this.state.choicesStore);
    choicesStore[choice]++ || (choicesStore[choice] = 1);
    this.setState({ choicesStore });
  }

  setNextFrame() {
    const currentIndex = this.state.index;
    // Jumps indexes because choices store
    if (
      this.state.choicesStore.pickedObject === 1 &&
      novelFrames[currentIndex].jumpBecauseStoreTo === "haveKey"
    ) {
      for (let i = 0; i < novelFrames.length; i++) {
        if (
          novelFrames[currentIndex].jumpBecauseStoreTo ===
          novelFrames[i].receiveJumpBecauseStore
        ) {
          this.setFrame(i);
        }
      }
    } else if (novelFrames[currentIndex].jumpTo) {
      // Jumps indexes normally
      if (novelFrames[currentIndex].jumpTo === "titleScreen") {
        this.setState(INITIAL_STATE);
      } else if (novelFrames[currentIndex].jumpTo) {
        // Resumes to common route
        for (let i = 0; i < novelFrames.length; i++) {
          if (novelFrames[currentIndex].jumpTo === novelFrames[i].receiveJump) {
            this.setFrame(i);
          }
        }
      }
    } else if (
      !this.state.choicesExist &&
      !this.state.loadMenuShown &&
      !this.state.saveMenuShown &&
      !this.state.titleScreenShown &&
      !this.state.backlogShown
    ) {
      // Sets to frame one index higher
      this.setFrame(currentIndex + 1); // Normal functionality; goes to the next frame via index
    }
  }

  setFrame(index) {
    // Makes sure the index is within the novelFrames array
    if (index >= novelFrames.length) {
      index = novelFrames.length - 1;
    } else if (index <= -1) {
      index = 0;
    }
    // Updates novelFrames with new index
    this.setState({
      index: index,
      text: novelFrames[index].text,
      bg: novelFrames[index].bg,
      bgm: novelFrames[index].bgm,
      choicesExist: novelFrames[index].choicesExist,
      sceneChange: novelFrames[index].sceneChange,
      sound: novelFrames[index].sound,
      speaker: novelFrames[index].speaker,
      sprite: novelFrames[index].sprite,
      spriteLeft: novelFrames[index].spriteLeft,
      spriteRight: novelFrames[index].spriteRight,
      voice: novelFrames[index].voice
    });
  }

  // For developers to see what index they're editing. To request, set logIndex to true in novelFrames.js.
  componentDidMount() {
    for (let i = 0; i < novelFrames.length; i++) {
      if (novelFrames[i].logIndex) {
        console.log([i]);
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // Update indexHistory if index changed
    if (prevState.index !== this.state.index) {
      this.setState({
        indexHistory: [...this.state.indexHistory, prevState.index]
      });
    }
  }

  renderFrame() {
    return (
      <RenderFrame
        setNextFrame={this.setNextFrame.bind(this)}
        bg={this.state.bg}
        sceneChange={this.state.sceneChange}
        sprite={this.state.sprite}
        spriteLeft={this.state.spriteLeft}
        spriteRight={this.state.spriteRight}
        speaker={this.state.speaker}
        text={this.state.text}
        textBoxShown={this.state.textBoxShown}
      />
    );
  }

  setNextChoice() {
    let choicesIndex = this.state.choicesIndex + 1;

    // Makes sure the index is within the Choices array
    if (choicesIndex >= Choices.length) {
      choicesIndex = Choices.length - 1;
    } else if (choicesIndex <= -1) {
      choicesIndex = 0;
    }

    this.setState({
      choicesIndex: choicesIndex,
      choiceOptions: Choices[choicesIndex].choices
    });
  }

  handleChoiceSelected(event) {
    this.stopSkip();
    this.setFrameFromChoice(event.currentTarget.name, event.currentTarget.id);
    this.setNextChoice();
  }

  renderChoiceMenu() {
    return (
      <ChoiceMenu
        choiceOptions={this.state.choiceOptions}
        onChoiceSelected={this.handleChoiceSelected.bind(this)}
      />
    );
  }

  toggleMenu() {
    this.setState(prevState => ({
      menuButtonsShown: !prevState.menuButtonsShown
    }));
  }

  toggleBacklog() {
    if (this.state.saveMenuShown) {
      this.setState({ saveMenuShown: false });
    }
    if (this.state.loadMenuShown) {
      this.setState({ loadMenuShown: false });
    }
    this.setState(prevState => ({
      backlogShown: !prevState.backlogShown
    }));
  }

  toggleTextBox() {
    this.setState(prevState => ({
      textBoxShown: !prevState.textBoxShown
    }));
  }

  toggleSaveMenu() {
    if (this.state.loadMenuShown) {
      this.setState({ loadMenuShown: false });
    }
    if (this.state.backlogShown) {
      this.setState({ backlogShown: false });
    }
    this.setState(prevState => ({
      saveMenuShown: !prevState.saveMenuShown
    }));
  }

  toggleLoadMenu() {
    if (this.state.saveMenuShown) {
      this.setState({ saveMenuShown: false });
    }
    if (this.state.backlogShown) {
      this.setState({ backlogShown: false });
    }
    this.setState(prevState => ({
      loadMenuShown: !prevState.loadMenuShown
    }));
  }

  startSkip() {
    const intervalTime = prompt(
      "How many milliseconds per frame would you like?",
      "75"
    );
    if (intervalTime > 0) {
      this.setState({
        isSkipping: true
      });
      this.textSkipper = setInterval(
        this.setNextFrame.bind(this),
        intervalTime
      );
    }
  }

  stopSkip() {
    clearInterval(this.textSkipper);
    this.setState({
      isSkipping: false
    });
  }

  // Saves and sets current state to local storage
  saveSlot(number) {
    localStorage.setItem("time" + number, new Date().toString()); // saves the current time to the save slot
    localStorage.setItem(
      number,
      JSON.stringify(this.state, (k, v) => (v === undefined ? null : v))
    );
    this.setState(this.state);
  }

  // Loads and sets state from local storage
  loadSlot(number) {
    this.setState(JSON.parse(localStorage.getItem(number)));
    this.setState({
      saveMenuShown: false
    }); // save menu to false and not load because save is true when saving
  }

  // "Begin" Button for title page.
  beginStory() {
    this.setState({
      isSkipping: false,
      titleScreenShown: false,
      frameIsRendering: true
    });
    this.setFrame(0);
    this.setState({
      choicesIndex: 0,
      choiceOptions: Choices[0].choices
    });
  }

  titleScreen() {
    return (
      <TitleScreen
        beginStory={this.beginStory.bind(this)}
        toggleLoadMenu={this.toggleLoadMenu.bind(this)}
      />
    );
  }

  saveMenu() {
    return (
      <SaveLoadMenu
        confirmationMessage="Overwrite save?"
        currentTime={this.state.currentTime}
        menuType="Save Menu"
        executeSlot={this.saveSlot.bind(this)}
        toggleMenu={this.toggleSaveMenu.bind(this)}
        speaker={this.state.speaker}
        text={this.state.text}
        textBoxShown={this.state.textBoxShown}
      />
    );
  }

  loadMenu() {
    return (
      <SaveLoadMenu
        confirmationMessage="Load save?"
        currentTime={this.state.currentTime}
        menuType="Load Menu"
        executeSlot={this.loadSlot.bind(this)}
        toggleMenu={this.toggleLoadMenu.bind(this)}
        speaker={this.state.speaker}
        text={this.state.text}
        textBoxShown={this.state.textBoxShown}
      />
    );
  }

  // the GUI interface on the bottom
  renderMenuButtons() {
    if (!this.state.buttonsDeleted) {
      return (
        <MenuButtons
          deleteButtons={() => this.setState({ buttonsDeleted: true })}
          menuButtonsShown={this.state.menuButtonsShown}
          toggleSaveMenu={this.toggleSaveMenu.bind(this)}
          toggleLoadMenu={this.toggleLoadMenu.bind(this)}
          saveSlot={this.saveSlot.bind(this)}
          loadSlot={this.loadSlot.bind(this)}
          saveMenuShown={this.state.saveMenuShown}
          loadMenuShown={this.state.loadMenuShown}
          toggleMenu={this.toggleMenu.bind(this)}
          toggleBacklog={this.toggleBacklog.bind(this)}
          toggleTextBox={this.toggleTextBox.bind(this)}
          startSkip={this.startSkip.bind(this)}
          stopSkip={this.stopSkip.bind(this)}
          isSkipping={this.state.isSkipping}
          textBoxShown={this.state.textBoxShown}
          backlogShown={this.state.backlogShown}
        />
      );
    }
  }

  backlog() {
    let loggedText = [];
    for (let i = 0; i < this.state.indexHistory.length; i++) {
      loggedText.unshift(
        <div className="backlog" key={loggedText.toString()}>
          <div className="backlog-speaker">
            {novelFrames[this.state.indexHistory[i]].speaker}
          </div>
          {novelFrames[this.state.indexHistory[i]].text}
        </div>
      );
    }

    return <div className="overlay backlog-overlay">{loggedText}</div>;
  }
  playBGM() {
    return (
      <Sound
        url={this.state.bgm}
        playStatus={Sound.status.PLAYING}
        loop="true"
      />
    );
  }
  playSound() {
    return <Sound url={this.state.sound} playStatus={Sound.status.PLAYING} />;
  }
  playVoice() {
    return <Sound url={this.state.voice} playStatus={Sound.status.PLAYING} />;
  }

  render() {
    return (
      <div>
        <ReactCSSTransitionGroup
          component="div"
          className="container"
          transitionName="menu"
          transitionEnterTimeout={500}
          transitionLeaveTimeout={300}
        >
          {this.state.titleScreenShown ? this.titleScreen() : null}
          {this.state.frameIsRendering ? this.renderFrame() : null}
          {/* GUI menu buttons */}
          {this.state.saveMenuShown ? this.saveMenu() : null}
          {this.state.loadMenuShown ? this.loadMenu() : null}
          {this.state.backlogShown ? this.backlog() : null}
          {this.state.frameIsRendering ? this.renderFrame() : null}
          {this.state.choicesExist ? this.renderChoiceMenu() : null}
        </ReactCSSTransitionGroup>
        {!this.state.titleScreenShown ? this.renderMenuButtons() : null}
        {this.playBGM()}
        {this.playSound()}
        {this.playVoice()}
      </div>
    );
  }
}

export default App;
