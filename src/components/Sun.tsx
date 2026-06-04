export function Sun() {
    return (
        <>
            <directionalLight args={[0xffffbb, 3]} position={[5, 10, 5]} />
            <ambientLight args={[0xffffff]} position={[0, 10, 0]} />
        </>
    );
}
