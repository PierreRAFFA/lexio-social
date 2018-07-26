import AppBase from './appBase';
import * as i18n from "i18n";
import logger from "./logger";

class App extends AppBase {

  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  constructor() {
    super();

    i18n.configure({
      locales: ['en', 'fr'],
      directory: './locales'
    });

  }
  ////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////  START
  /**
   * Starts the app
   *
   * @returns {Promise<void>}
   */
  public async start(): Promise<void> {
    super.start();
  }
}

export default App;
