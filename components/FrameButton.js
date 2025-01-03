export default function FrameButton({ label, onClick }) {
    return (
        <button style={{ padding: "10px 20px", margin: "10px" }} onClick={onClick}>
            {label}
        </button>
    );
}
