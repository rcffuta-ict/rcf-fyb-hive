

export type FormError  = {
    [key: string]: string | null;
};


export interface FormElement {
    onChange: (key:string, val:any) => void;
    getValue: (key: string) => string | boolean;
    required?: boolean;
    error?: FormError | null;
    disable?: boolean;
}
