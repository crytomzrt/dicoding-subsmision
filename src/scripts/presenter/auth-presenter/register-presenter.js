import AuthModel from "../../models/auth-model";

export default class RegisterPagePresenter {
  constructor(view) {
    this.view = view;
  }

  async init() {
    try {
      // Attach form submission listener to handle registration logic
      this.view.addSubmitListener(this.handleRegisterSubmit.bind(this));
    } catch (error) {
      console.error("Error initializing RegisterPagePresenter:", error);
    }
  }

  async handleRegisterSubmit(event) {
    event.preventDefault();
    const formData = this.view.getFormData();
    const { name, email, password } = formData;

    // Reset error message
    this.view.hideErrorMessage();

    try {
      // Show loading state
      this.view.setLoadingState(true);

      // Attempt registration using AuthModel
      await AuthModel.register(name, email, password);

      // Redirect to login page after successful registration
      window.location.href = "/login";
    } catch (error) {
      // Show error message if registration fails
      this.view.setErrorMessage(error.message);
    } finally {
      // Reset loading state
      this.view.setLoadingState(false);
    }
  }
}
