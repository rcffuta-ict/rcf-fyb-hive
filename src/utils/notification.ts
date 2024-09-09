import { message as Message, notification } from "antd";

export const openNotificationWithIcon = (type: 'success' | 'error', message: string, description: string, notify?:boolean) => {


    if (notify) {

        const handle = type === 'success' ? notification.success : notification.error;
        
        handle({
            message,
            description,
        });

        return
    }


    if (type === 'success') return Message.success(description);
    if (type === 'error') return Message.error(description);
};