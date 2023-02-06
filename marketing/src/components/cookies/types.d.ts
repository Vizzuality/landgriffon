export interface CookiesProps {
  /**
   * Whether the modal is opened
   */
  open: boolean;
  /**
   * Callback executed when the cookies are accepted
   */
  onAccept: () => void;
  /**
   * Callback executed when the cookies are rejected
   */
  onReject: () => void;
}
