import React, { useState, useMemo, useRef, useEffect } from 'react';
import { User, Listing, Message } from '../../types';
import { useToast } from '../Toast';

interface MessagesPageProps {
  messages: Message[];
  currentUser: User;
  listings: Listing[];
  users: User[]; // Pass all users to find profiles reliably
  activeConversation: { partner: User; listing: Listing } | null;
  onSendMessage: (type: 'text' | 'image' | 'audio', content: string) => void;
  onStartConversation: (partner: User, listing: Listing) => void;
  onBackToInbox: () => void;
}

const getMessagePreview = (message: Message) => {
    switch (message.type) {
        case 'image':
            return '[صورة]';
        case 'audio':
            return '[رسالة صوتية]';
        case 'text':
        default:
            return message.content;
    }
};


const InboxView: React.FC<Omit<MessagesPageProps, 'activeConversation' | 'onBackToInbox' | 'onSendMessage'>> = ({ messages, currentUser, listings, users, onStartConversation }) => {

    const usersById = useMemo(() => {
        return users.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
        }, {} as Record<number, User>);
    }, [users]);

    const listingsById = useMemo(() => {
        return listings.reduce((acc, listing) => {
            acc[listing.id] = listing;
            return acc;
        }, {} as Record<number, Listing>);
    }, [listings]);

    const conversations = useMemo(() => {
        const convos: { [key: string]: { partner: User; listing: Listing; lastMessage: Message } } = {};

        messages
            .filter(m => m.senderId === currentUser.id || m.receiverId === currentUser.id)
            .forEach(message => {
                const partnerId = message.senderId === currentUser.id ? message.receiverId : message.senderId;
                const key = `${partnerId}-${message.listingId}`;
                const partner = usersById[partnerId];
                const listing = listingsById[message.listingId];

                if (partner && listing) {
                    if (!convos[key] || new Date(message.createdAt) > new Date(convos[key].lastMessage.createdAt)) {
                       convos[key] = { partner, listing, lastMessage: message };
                    }
                }
            });

        return Object.values(convos).sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime());
    }, [messages, currentUser.id, usersById, listingsById]);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">المحادثات</h1>
            {conversations.length > 0 ? (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <ul className="divide-y divide-slate-100">
                        {conversations.map(({ partner, listing, lastMessage }) => (
                            <li key={`${partner.id}-${listing.id}`} onClick={() => onStartConversation(partner, listing)} className="p-4 hover:bg-purple-50 transition cursor-pointer flex items-center space-s-4">
                                <img className="w-14 h-14 rounded-full object-cover" src={partner.avatarUrl} alt={partner.name} />
                                <div className="flex-grow overflow-hidden">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-slate-800">{partner.name}</h3>
                                        <p className="text-xs text-slate-400 flex-shrink-0">{new Date(lastMessage.createdAt).toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    <p className="text-sm text-slate-600 truncate">حول: {listing.title}</p>
                                    <p className="text-sm text-slate-500 truncate mt-1">
                                        {lastMessage.senderId === currentUser.id && 'أنت: '}
                                        {getMessagePreview(lastMessage)}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-slate-600">لا يوجد لديك محادثات بعد</h2>
                    <p className="text-slate-500 mt-2">عندما تبدأ محادثة، ستظهر هنا.</p>
                </div>
            )}
        </div>
    );
};

const PlayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
    </svg>
);

const PauseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
    </svg>
);

const AudioPlayer: React.FC<{ src: string, theme: 'sender' | 'receiver' }> = ({ src, theme }) => {
    const audioRef = useRef(new Audio(src));
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    const themeClasses = {
        receiver: {
            buttonBg: 'bg-slate-200',
            buttonIcon: 'text-slate-600',
            track: 'bg-slate-300',
            progress: 'bg-slate-500',
            handle: 'bg-slate-500',
            time: 'text-slate-500'
        },
        sender: {
            buttonBg: 'bg-white/25',
            buttonIcon: 'text-white',
            track: 'bg-white/40',
            progress: 'bg-white',
            handle: 'bg-white',
            time: 'text-purple-200'
        }
    };
    const colors = themeClasses[theme];

    useEffect(() => {
        const audio = audioRef.current;
        const setAudioData = () => {
            if (isFinite(audio.duration)) {
                setDuration(audio.duration);
            }
            setCurrentTime(audio.currentTime);
        };
        const setAudioTime = () => setCurrentTime(audio.currentTime);
        const onEnded = () => setIsPlaying(false);

        audio.addEventListener("loadeddata", setAudioData);
        audio.addEventListener("timeupdate", setAudioTime);
        audio.addEventListener("ended", onEnded);

        return () => {
            audio.removeEventListener("loadeddata", setAudioData);
            audio.removeEventListener("timeupdate", setAudioTime);
            audio.removeEventListener("ended", onEnded);
        };
    }, []);

    const togglePlayPause = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (time: number) => {
        if (isNaN(time) || time === 0) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };
    
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="flex items-center gap-3 w-64 p-1">
            <button onClick={togglePlayPause} className={`w-10 h-10 flex-shrink-0 flex items-center justify-center ${colors.buttonBg} ${colors.buttonIcon} rounded-full`}>
                {isPlaying ? <PauseIcon className="w-5 h-5"/> : <PlayIcon className="w-5 h-5 ml-0.5"/>}
            </button>
            <div className="relative w-full h-8 flex items-center">
                <div className={`h-1 ${colors.track} w-full rounded-full`}></div>
                <div className={`absolute top-1/2 -translate-y-1/2 h-1 ${colors.progress} rounded-full`} style={{ width: `${progress}%` }}></div>
                <div className={`absolute w-3 h-3 ${colors.handle} rounded-full top-1/2 -translate-y-1/2`} style={{ left: `calc(${progress}% - 6px)` }}></div>
            </div>
            <span className={`text-xs font-mono ${colors.time}`}>{formatTime(duration)}</span>
        </div>
    );
};


const MessageContent: React.FC<{ message: Message; isSender: boolean; }> = ({ message, isSender }) => {
    switch (message.type) {
        case 'image':
            return <img src={message.content} alt="Image message" className="rounded-lg max-w-xs cursor-pointer" onClick={() => window.open(message.content, '_blank')} />;
        case 'audio':
            return <AudioPlayer src={message.content} theme={isSender ? 'sender' : 'receiver'} />;
        case 'text':
        default:
            return <p className="whitespace-pre-wrap break-words">{message.content}</p>;
    }
}

const ConversationView: React.FC<Omit<MessagesPageProps, 'onStartConversation' | 'listings' | 'users'>> = ({ messages, currentUser, activeConversation, onSendMessage, onBackToInbox }) => {
    const { partner, listing } = activeConversation!;
    const [newMessage, setNewMessage] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerIntervalRef = useRef<number | null>(null);
    const audioStreamRef = useRef<MediaStream | null>(null);
    const { addToast } = useToast();


    const conversationMessages = useMemo(() => {
        return messages.filter(m =>
            m.listingId === listing.id &&
            ((m.senderId === currentUser.id && m.receiverId === partner.id) ||
             (m.senderId === partner.id && m.receiverId === currentUser.id))
        ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }, [messages, currentUser.id, partner.id, listing.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [conversationMessages]);
    
     // Universal cleanup function
    const cleanupRecordingResources = () => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach(track => track.stop());
            audioStreamRef.current = null;
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        mediaRecorderRef.current = null;
        audioChunksRef.current = [];
        setIsRecording(false);
        setRecordingTime(0);
    };

    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            cleanupRecordingResources();
        };
    }, []);

    const handleSendText = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (newMessage.trim()) {
            onSendMessage('text', newMessage.trim());
            setNewMessage('');
        }
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    onSendMessage('image', event.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    // Helper to find the best supported MIME type
    const getSupportedMimeType = () => {
        const types = [
            'audio/webm;codecs=opus',
            'audio/mp4', // Good fallback for Safari
            'audio/ogg;codecs=opus',
            'audio/webm',
        ];
        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }
        return ''; // Fallback to browser default
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioStreamRef.current = stream;
            
            const mimeType = getSupportedMimeType();
            const options = mimeType ? { mimeType } : {};
            
            mediaRecorderRef.current = new MediaRecorder(stream, options);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = event => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };
            
            // This is the main event handler for when recording stops.
            mediaRecorderRef.current.onstop = () => {
                if (audioChunksRef.current.length > 0) {
                    const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType });
                    
                    if (audioBlob.size > 100) { // Check for a minimum size to avoid empty files
                        const reader = new FileReader();
                        reader.onload = () => {
                            onSendMessage('audio', reader.result as string);
                        };
                        reader.readAsDataURL(audioBlob);
                    } else {
                       addToast('info', 'لم يتم تسجيل صوت', 'تم إلغاء الرسالة الصوتية لأنها كانت قصيرة جداً.');
                    }
                }
                // Crucially, clean up resources AFTER processing the blob.
                cleanupRecordingResources();
            };
            
            mediaRecorderRef.current.start();
            setIsRecording(true);
            timerIntervalRef.current = window.setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            addToast('error', 'خطأ في الميكروفون', 'لا يمكن الوصول إلى الميكروفون. يرجى التحقق من الأذونات في إعدادات المتصفح.');
            cleanupRecordingResources();
        }
    };
    
    const stopRecording = (send: boolean) => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            if (!send) {
                 // To cancel, we need to stop without processing the data.
                 // The onstop handler will still run, so we modify a ref to signal cancellation.
                 // A simpler way is to just let it stop and the handler will find an empty chunk array.
                 audioChunksRef.current = [];
            }
            mediaRecorderRef.current.stop();
        } else {
            // If called in a non-recording state, just ensure everything is clean.
            cleanupRecordingResources();
        }
    };
    
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    return (
        <div className="container mx-auto h-[calc(100vh-80px)] flex flex-col p-4">
            <div className="bg-white rounded-2xl shadow-xl flex-grow flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center p-4 border-b border-slate-100 bg-slate-50/50">
                    <button onClick={onBackToInbox} className="p-2 rounded-full hover:bg-slate-200 transition me-3">
                        <ArrowRightIcon className="w-6 h-6 text-slate-600" />
                    </button>
                    <img src={partner.avatarUrl} alt={partner.name} className="w-11 h-11 rounded-full object-cover" />
                    <div className="ms-3">
                        <h2 className="font-bold text-slate-800">{partner.name}</h2>
                        <p className="text-sm text-slate-500">بخصوص: <span className="font-semibold">{listing.title}</span></p>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-grow p-6 overflow-y-auto bg-slate-50">
                    <div className="space-y-4">
                        {conversationMessages.map(message => {
                            const isSender = message.senderId === currentUser.id;
                            return (
                                <div key={message.id} className={`flex items-end gap-3 ${isSender ? 'justify-end' : 'justify-start'}`}>
                                    {!isSender && (
                                        <img src={partner.avatarUrl} alt={partner.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0 self-end" />
                                    )}
                                    <div className={`max-w-xs md:max-w-md lg:max-w-lg rounded-2xl shadow-sm ${isSender ? 'bg-purple-600 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none'} ${message.type === 'text' ? 'p-1 px-4 py-3' : ''}`}>
                                        <MessageContent message={message} isSender={isSender} />
                                        <p className={`text-xs mt-1 text-right ${isSender ? 'text-purple-200' : 'text-slate-500'} ${message.type !== 'text' ? 'px-2' : ''}`}>
                                            {new Date(message.createdAt).toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                         <div ref={messagesEndRef} />
                    </div>
                </div>
                
                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-100">
                    {isRecording ? (
                         <div className="flex items-center w-full gap-3">
                           <button onClick={() => stopRecording(false)} className="p-3 text-red-500 hover:bg-red-100 rounded-full transition"><TrashIcon className="w-6 h-6"/></button>
                           <div className="flex items-center justify-center flex-grow bg-slate-100 rounded-full px-4 py-3">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="ms-3 text-slate-700 font-mono">{formatTime(recordingTime)}</span>
                           </div>
                           <button onClick={() => stopRecording(true)} className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition transform hover:scale-110"><SendIcon className="w-6 h-6"/></button>
                         </div>
                    ) : (
                        <form onSubmit={handleSendText} className="flex items-center gap-3">
                            <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageChange} className="hidden" />
                            <button type="button" onClick={() => imageInputRef.current?.click()} className="p-3 text-slate-500 hover:bg-slate-200 rounded-full transition"><PaperClipIcon className="w-6 h-6"/></button>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="اكتب رسالتك هنا..."
                                className="w-full py-3 px-4 bg-slate-100 border border-transparent rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-slate-800 placeholder:text-slate-400"
                            />
                            {newMessage ? (
                                <button type="submit" className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                                   <SendIcon className="w-6 h-6" />
                                </button>
                            ) : (
                                <button type="button" onClick={startRecording} className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                                   <MicrophoneIcon className="w-6 h-6" />
                                </button>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};


const MessagesPage: React.FC<MessagesPageProps> = (props) => {
    if (props.activeConversation) {
        return <ConversationView {...props} />;
    }
    return <InboxView {...props} />;
};

// --- SVG Icons ---
const ArrowRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" /></svg>);
const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>);
const PaperClipIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3.375 3.375 0 1112.8 6.649l-9.596 9.597a1.5 1.5 0 002.122 2.122l7.693-7.693-2.121-2.122z" /></svg>);
const MicrophoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m12 0v-1.5a6 6 0 00-12 0v1.5m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09.92-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>);

export default MessagesPage;