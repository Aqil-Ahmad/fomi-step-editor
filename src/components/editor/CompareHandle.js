import styles from "./CompareHandle.module.css";

export function CompareHandle({ handleRef, label, onPointerDown, onKeyDown, onDoubleClick, valueNow }) {
  return (
    <div className={styles.line}>
      <span
        ref={handleRef}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-orientation="horizontal"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={valueNow}
        aria-valuetext={`${valueNow}% original`}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
        onDoubleClick={onDoubleClick}
        className={styles.knob}
      >
        <svg aria-hidden="true" width="20" height="12" viewBox="0 0 22 14" fill="none">
          <path
            d="M6 2L1 7l5 5M16 2l5 5-5 5"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
}
