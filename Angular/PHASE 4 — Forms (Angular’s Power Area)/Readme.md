# PHASE 4 - Forms (Angular's Power Area)

## Goal
Become genuinely strong with **Reactive Forms** (enterprise default), including typed forms (Angular 14), custom validators, async validators, dynamic forms with `FormArray`, and production-grade error display patterns.

## Topics
1. **Template-Driven Forms (Quick)**
   - Basic understanding only
   - When NOT to use them
2. **Reactive Forms (Critical)**
   - `FormGroup`, `FormControl`, `FormBuilder`
   - Validators (sync + async)
   - `FormArray` + dynamic forms
   - Form state management patterns

---

## 1) Template-Driven Forms (Quick)

### Concepts
- Template-driven forms use directives like `ngModel` to create the form model implicitly from the template.
- You primarily work in HTML, with Angular building `FormControl`s behind the scenes.

### Why it exists ✅
- ⚡ Fast for small/simple forms.

### How Angular uses it internally 🔍
- `FormsModule` directives register controls with a parent `NgForm`.
- The model is built at runtime based on DOM + directives (less explicit, harder to unit test).

### Example
```html
<form #f="ngForm" (ngSubmit)="save()">
  <input name="email" [(ngModel)]="email" required email />
  <button [disabled]="f.invalid">Save</button>
</form>
```

### ✅ Best Practices
- Use template-driven forms only for small forms with simple validation.

### ❌ Avoid
- Complex dynamic forms, cross-field validation, and advanced async validation using template-driven style.

### 🎯 Interview insight
- "Reactive forms scale better because the form model is explicit and testable."

---

## 2) Reactive Forms (Critical)

### Concepts
- Reactive forms are model-first:
  - you construct the form model in TS (`FormGroup`, `FormControl`, `FormArray`)
  - template binds to it (`[formGroup]`, `formControlName`, `formArrayName`)
- Control state:
  - `value`, `status` (`VALID`/`INVALID`/`PENDING`), `errors`
  - `touched`, `dirty`, `pristine`
  - `valueChanges` and `statusChanges`

### Why it exists ✅
- 🧠 Explicit state machine for complex forms.
- 🧪 Easy unit testing without rendering a UI.
- 🧩 Dynamic fields (`FormArray`) and predictable validation.

### How Angular uses it internally (ControlValueAccessor) 🧠
The bridge between DOM and form model is **ControlValueAccessor (CVA)**.
- For native inputs, Angular ships CVAs.
- For custom components (`<app-date-picker>`), you implement CVA so it behaves like a form control.

> 🔍 This is the answer to "how does Angular connect an `<input>` to a `FormControl`?"

### Setup
`app.module.ts`:
```ts
import { ReactiveFormsModule } from '@angular/forms';
@NgModule({ imports: [ReactiveFormsModule] })
export class AppModule {}
```

---

### Typed forms (Angular 14) ✅
Typed forms reduce runtime mistakes and eliminate many `as any` casts.

`login-form.component.ts`:
```ts
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

type LoginForm = FormGroup<{
  email: FormControl<string>;
  password: FormControl<string>;
}>;

@Component({ selector: 'app-login-form', templateUrl: './login-form.component.html' })
export class LoginFormComponent {
  form: LoginForm = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    // call facade/service
  }
}
```

---

### Validators (sync)

#### Concepts
- Validators are pure functions that return `ValidationErrors | null`.
- Cross-field validators attach to a `FormGroup`.

#### Example: password match (cross-field)
```ts
import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirm')?.value;
  return password && confirm && password !== confirm ? { passwordsMismatch: true } : null;
}
```

Use:
```ts
this.form = this.fb.group(
  { password: ['', Validators.required], confirm: ['', Validators.required] },
  { validators: [passwordsMatch] }
);
```

---

### Validators (async)

#### Concepts
- Async validators return `Observable<ValidationErrors | null>`.
- Control becomes `PENDING` while async validator runs.

#### Example: username availability
```ts
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export function usernameAvailable(api: { check: (u: string) => Observable<boolean> }): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const username = String(control.value ?? '').trim();
    if (!username) return of(null);
    return api.check(username).pipe(
      map((available) => (available ? null : { usernameTaken: true })),
      catchError(() => of(null))
    );
  };
}
```

✅ Best practice: combine with `updateOn: 'blur'` for expensive validators:
```ts
new FormControl('', { nonNullable: true, updateOn: 'blur', asyncValidators: [usernameAvailable(api)] })
```

---

### Dynamic forms with `FormArray` (production pattern)

#### Concepts
- `FormArray` is the correct tool for lists of controls/groups: skills, addresses, phone numbers.

#### Example: skills list
```ts
import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

type SkillsForm = FormGroup<{
  name: FormControl<string>;
  skills: FormArray<FormControl<string>>;
}>;

@Component({ selector: 'app-skills-editor', templateUrl: './skills-editor.component.html' })
export class SkillsEditorComponent {
  form: SkillsForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    skills: new FormArray<FormControl<string>>([]),
  });

  get skills(): FormArray<FormControl<string>> {
    return this.form.controls.skills;
  }

  addSkill(): void {
    this.skills.push(new FormControl('', { nonNullable: true, validators: [Validators.required] }));
  }

  removeSkill(i: number): void {
    this.skills.removeAt(i);
  }
}
```

`skills-editor.component.html`:
```html
<form [formGroup]="form">
  <input formControlName="name" placeholder="Name" />

  <div formArrayName="skills">
    <button type="button" (click)="addSkill()">+ Add skill</button>

    <div *ngFor="let ctrl of skills.controls; let i = index">
      <input [formControlName]="i" placeholder="Skill" />
      <button type="button" (click)="removeSkill(i)">Remove</button>
      <small *ngIf="ctrl.touched && ctrl.invalid">Skill is required</small>
    </div>
  </div>
</form>
```

---

### Error display: a clean, repeatable pattern ✅
You want errors to show at the right time:
- after field touched, OR
- after submit attempt

Simple pattern:
```ts
submitted = false;
submit(): void {
  this.submitted = true;
  if (this.form.invalid) return;
}
showError(ctrl: { invalid: boolean; touched: boolean }): boolean {
  return ctrl.invalid && (ctrl.touched || this.submitted);
}
```

### ✅ Best Practices
- Default to reactive forms for production apps.
- Use typed forms (Angular 14) to eliminate a class of bugs.
- Keep form-to-API mapping explicit (map to DTO; don't send raw form object blindly).
- Use `patchValue` for partial updates; reserve `setValue` for full shapes.
- Use `markAllAsTouched()` on submit when you want all errors visible.

### ❌ Avoid
- Mixing template-driven (`ngModel`) with reactive forms in the same form.
- Subscribing to `valueChanges` everywhere without cleanup or without a clear reason.
- Updating the same control inside its `valueChanges` without guard (infinite loop).

### Common mistakes 🧯
- Control stuck `PENDING`: async validator observable never completes.
- `setValue` throws: you forgot a field. Use `patchValue` for partial updates.
- Disabled controls missing from `form.value`: use `getRawValue()` if you need them.

### 🎯 Interview insights
- Explain CVA (how custom components integrate with forms).
- Explain cross-field validation (group validator) and async validation (PENDING status).
- Mention typed forms as Angular 14 feature.

---

## Hands-on (Do This)
- Build a multi-step "Profile Editor" form:
  - Cross-field validation (password match, date range, etc.)
  - Dynamic add/remove controls (`FormArray`)
  - 1 async validator (username/email availability)
  - Error display pattern that does not spam errors before the user interacts

## Exit Criteria
- You can build non-trivial forms without brittle template logic.
- You can explain CVA, group validators, async validators, and form arrays confidently.

## Next
- Continue to `../PHASE 5 — HTTP, APIs, and Side Effects/Readme.md`

