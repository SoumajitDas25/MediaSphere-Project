import { useEffect, useRef } from "react";
import eventBus from "../eventBus";
import { useSelector } from "react-redux";

const useSyncEvents = ({
  domain,
  id,
  publicHandlers = {
    onUpdate:null,
    onReload:null,
    onDelete:null
  },
  privateHandlers = {
    onUpdate:null,
    onReload:null,
    onDelete:null
  }
}) => {

  const isSocketConnected = useSelector(state=>state.auth.isSocketConnected);
  // Keep updated handlers in refs so closures always stay fresh
  const publicRef = useRef(publicHandlers);
  const privateRef = useRef(privateHandlers);

  publicRef.current = publicHandlers;
  privateRef.current = privateHandlers;

  useEffect(() => {

    if (!domain || !id) return;

    if(isSocketConnected)
    {
      //emit join room event
      eventBus.emit('joinRoom',{ domain, id });
      console.log(`join ${domain} room`);
    }

    //public listener
    const publicListener = (payload) => {

      if (payload.domain.toLowerCase() === domain.toLowerCase() && payload.id === id) 
      {
        const { action, field=null, value=null, source=null } = payload;
        const handlers = publicRef.current;

        switch (action) {
          case "update":
            handlers.onUpdate?.({ field:field?.toLowerCase() , value });
            break;

          case "delete":
            handlers.onDelete?.();
            break;

          case "reload":
            handlers.onReload?.({ source:source?.toLowerCase() ,value });
            break;

          default:
            break;
        }
      };
    }

    //private listener
    const privateListener = (payload) => {
      
      if (payload.domain.toLowerCase() === domain.toLowerCase() && payload.id === id) 
      {
        const { action, field=null, value=null, source=null } = payload;
        const handlers = privateRef.current;

        switch (action) {
          case "update":
            if(field)
              handlers.onUpdate?.({ field:field?.toLowerCase() , value });
            break;

          case "delete":
            handlers.onDelete?.();
            break;

          case "reload":
            if(source)
              handlers.onReload?.({ source:source?.toLowerCase() ,value });
            break;

          default:
            break;
        }
      };           
    }

    //attach listeners
    eventBus.on("public:sync", publicListener);
    eventBus.on("private:sync", privateListener);

    return () => {

    if(isSocketConnected)
    {
      //emit leave room event
      eventBus.emit('leaveRoom',{ domain, id });
      console.log(`left ${domain} room`);
    }
      //remove listeners
      eventBus.off("public:sync", publicListener);
      eventBus.off("private:sync", privateListener);
    };

  }, [isSocketConnected, domain, id]);
};

export default useSyncEvents;