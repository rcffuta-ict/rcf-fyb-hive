import { Input, Select } from "antd";

const { Option } = Select;

interface SelectInputProps {
    name: string;
    label: string;
    placeholder?: string;
    tag?: boolean;
}


export default function SelectInput(props: SelectInputProps) {

    const predefinedHobbies = ['Reading', 'Gaming', 'Cooking', 'Traveling'];

    


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

            <Select
                mode="tags"
                style={{ width: '100%' }}
                placeholder="Select or type your hobbies"
            >
                {predefinedHobbies.map((hobby) => (
                    <Option key={hobby} value={hobby}>
                    {hobby}
                    </Option>
                ))}
            </Select>

        </label>
    )
}
