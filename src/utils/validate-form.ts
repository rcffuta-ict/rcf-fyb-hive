import { FormError } from "@/components/Form/form.interface";

export function validateFinalistForm(_data: any) {
    const _formError: FormError = {};

    const {
        firstname, lastname,
        picture, gender, contact,
        email, partV, worker, unit,
        exco, portfolio

    } = _data;


    let suffix = '';

    if (!gender) _formError.gender = 'Male/Female please?'

    if (gender) {
        suffix = ' ' + (gender === 'male' ? 'sir': 'ma');
    }


    if (!firstname) _formError.firstname = 'First name is required' + suffix
    if (!lastname) _formError.lastname = 'Last name is required'+ suffix
    if (!picture) _formError.picture = 'Your picture is required'+ suffix
    if (!contact) _formError.contact = 'Your contact is required'+ suffix
    if (!email) _formError.email = 'Your email address is required'+ suffix
    if (partV === undefined) _formError.partV = 'Part IV or Part V'+ suffix +'?'

    if (worker === undefined) _formError.worker = 'Are you a worker or not'+ suffix +'?'

    if (worker) {
        if (!unit) _formError.unit = 'What unit'+ suffix +'?'
    }


    if (exco === undefined) _formError.exco = 'Are you an executive or not'+ suffix +'?'

    if (exco) {
        if (!portfolio) _formError.portfolio = 'What office'+ suffix +'?'
    }


    if (Object.keys(_formError).length < 1) {
        return null
    }

    return _formError;

}

export function validateAssociatetForm(_data: any) {
    const _formError: FormError = {};

    const {
        firstname, lastname,
        picture, gender, contact,
        email, relationsipWithAssociate

    } = _data;


    let suffix = '';

    if (!gender) _formError.gender = 'Male/Female please?'

    if (gender) {
        suffix = ' ' + (gender === 'male' ? 'sir': 'ma');
    }


    if (!firstname) _formError.firstname = 'First name is required' + suffix
    if (!lastname) _formError.lastname = 'Last name is required'+ suffix
    if (!picture) _formError.picture = 'Your picture is required'+ suffix
    if (!contact) _formError.contact = 'Your contact is required'+ suffix
    if (!email) _formError.email = 'Your email address is required'+ suffix
    if (!relationsipWithAssociate) _formError.relationsipWithAssociate = 'Please tell us'+ suffix +'...'

    if (Object.keys(_formError).length < 1) {
        return null
    }

    return _formError;

}
