import React, { useEffect, useRef, useState } from 'react';
import "./Chat.css";
import ReactMarkDown from "react-markdown"
import remarkGfm from "remark-gfm"
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter"
import { materialDark} from 'react-syntax-highlighter/dist/esm/styles/prism';

function Chat() {
    const [messages,setMessages] = useState([
        // {sender: "user", text:"Hello"},
        // {sender: "bot", text:"Hello, How are you?"},
        // {sender: "user", text:"I am doing good can you help me to code"}
    ]);
    const [input,setInput] = useState("");
    const [isTyping, setisTyping] = useState(false);
    const [darkTheme,setDarkTheme] = useState(false);
    const messageEndRef = useRef(null);
    const scollToBottom = () => {
        messageEndRef.current?.scrollIntoView({befavior: "smooth"})
    };

    useEffect(scollToBottom,[messages])
    const sendMessage = async() => {
        if(!input.trim()) return
        const userMessages = {sender:"user", text:input}
        setMessages((prevMessages) => [...prevMessages, userMessages])
        setInput("")
        setisTyping(true)
        try{
            const respone = await fetch("http://127.0.0.1:5000/chat",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({message:input})
            })

            const reader = respone.body.getReader()
            const decoder = new TextDecoder("utf-8")
            let botResponse = "";

            setisTyping(false);
            // const processLine = (line) =>{
            //     {console.log(line)}

            //     if(line.startsWith("{data}")){

            //         const data = JSON.parse(line.slice(6));

            //         botResponse += data.response;
            //         setMessages((prevMessages) => {
            //             const newMessage = [...prevMessages];
            //             if(newMessage[newMessage.length - 1].sender === "bot"){
            //                 newMessage[newMessage.length - 1].text = botResponse;
            //             }else{
            //                 newMessage.push({sender: "bot", text:botResponse})
            //             }
            //             return newMessage;
            //         })
            //     }else if(line === "event: end"){
            //         setisTyping(false)
            //     }
            // }
            while (true){
                const {value, done} = await reader.read()
                    if(done) break
                const chunk = decoder.decode(value)
                let json_resp = JSON.parse(chunk)
                botResponse = json_resp.response
                setMessages((prevMessages) => {
                    const newMessage = [...prevMessages];
                    console.log({newMessage})
                    if(newMessage[newMessage.length - 1].sender === "bot"){
                        newMessage[newMessage.length - 1].text = botResponse;
                    }else{
                        newMessage.push({sender: "bot", text:botResponse})
                    }
                    return newMessage;
                })
                // const lines =chunk.split("\n\n")
                // lines.forEach(processLine)
            }
        }catch(error){
            console.error("Error Sending Message", error)
        }
    };

    return (
    <div className={`chat-container ${darkTheme ? "dark-theme" : " "}`}>
        <div className="glassy-transparent">
            <button className="darkBtn" onClick={() => setDarkTheme(!darkTheme)}>
                {!darkTheme ? "🌞" : "🌕"}
            </button>
        </div>

        <div className='messages'>
            {messages.map((msg, index)=>(
                <div key={index} className={`message-container ${msg.sender}`}>
                    <div className={`message ${msg.sender}`}>
                        <ReactMarkDown
                            children={msg.text}
                            remarkPlugins={[remarkGfm]}
                            components={{
                                code({node,inline, className, children, ...props}){
                                    const match = /language-(\w+)/.exec(className || "")
                                    return !inline && match?(
                                        <SyntaxHighlighter
                                        children ={String(children).replace(/\n$/,"")}
                                        style={materialDark} 
                                        language={match[1]}
                                        PreTag ="div"
                                        {...props}    
                                        />
                                    ):(
                                        <code className={className} {...props}>
                                            {children}
                                        </code>
                                     )
                                }
                            }}
                        />
                    </div>
                </div>
            ))}
            {isTyping && (
                <div className="message-container bot">
                    <div className="message bot">
                        <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            )}
                <div ref ={messageEndRef} />

        </div>
        <div className="input-container">
            <input 
                type="text" 
                value ={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder="Type a message..."/>
            <button className="button" onClick={sendMessage}>Send</button>
        </div>
    </div>
  )
}

export default Chat