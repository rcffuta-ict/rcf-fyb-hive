import { Input } from "antd";
import { FormElement } from "./form.interface";



interface TextInputProps extends FormElement {
    name: string;
    label: string;
    placeholder?: string;
    email?: boolean;
    tel?: boolean;
    password?: boolean;
    maxLength?: number;
    toUpperCase?: boolean;
}


export default function TextInput(props: TextInputProps) {

    function revealError() {
        // const errorMessage = props.error ? props.error[props.name] : null;

        if (!props.error) return;

        if (!props.error[props.name]) return;

        return (props.error[props.name]) || ` `;
    }


    // Function to format the phone number
    const formatPhoneNumber = (value: string) => {
        // Remove all non-numeric characters
        const digits = value.replace(/[^\d]/g, '');
        
        // Only return numeric value
        // return digits.length <= 10 ? digits : digits.slice(1); // Remove the leading '0' if present

        const n = Number(digits);

        return n===0? '' : n.toString();
    };

    let type = 'text';
    let addon;

    if (props.email) {
        type = 'email'
    }

    if (props.tel) {
        type = 'tel'
    }

    if (props.password) {
        type = 'password'
    }

    return (
        <label
            htmlFor={props.name}
            className="form-input"
        >
            <span
                className="text-capitalize fw-400 fs-14 lh-27"
            >
                {props.label}
            </span>

            <Input
                placeholder={props.placeholder}
                type={type}
                addonBefore={props.tel ? '+234' : ''}
                onChange={(e)=>{
                    const value = e.target.value;

                    if (type === 'email') {
                        props.onChange(props.name, value.toLowerCase())
                    }
                    else if (type === 'tel') {
                        props.onChange(props.name, formatPhoneNumber(value))
                    }

                    else {

                        props.onChange(props.name, value);
                    }
                }}
                disabled={props.disable}
                // value={props.getValue(props.name) as string}
                value={props.getValue(props.name) as string}
                maxLength={props.maxLength || 200}
                className={props.toUpperCase ? 'text-uppercase': ''}
                // pattern={type === 'tel' ? "[\d\s\-\(\)]{10,15}": undefined}
            />


            <b className="error-display">{revealError()}</b>

        </label>
    )
}
