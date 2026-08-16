function Home({ onStart }) {
    return (
        <div>
            <h1>PROJECT LIMEN</h1>

            <p>나만의 캐릭터를 만들고 세계에 들어가세요.</p>

            <button onClick={onStart}> 캐릭터 만들기 </button>
        </div>
    )
}

export default Home