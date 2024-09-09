import { Input } from "antd";
import { FormElement } from "./form.interface";



interface TextInputProps extends FormElement {
    name: string;
    label: string;
    placeholder?: string;
    email?: boolean;
    tel?: boolean;
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

    let type = 'text';
    let addon;

    if (props.email) {
        type = 'email'
    }

    if (props.tel) {
        type = 'tel'
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
                onChange={(e)=>props.onChange(props.name, e.target.value)}
                disabled={props.disable}
                value={props.getValue(props.name) as string}
                maxLength={props.maxLength || 200}
                className={props.toUpperCase ? 'text-uppercase': ''}
            />


            <b className="error-display">{revealError()}</b>

        </label>
    )
}
