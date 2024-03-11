using System.ComponentModel.DataAnnotations;
using System.Linq;

public class ProviderAttribute : ValidationAttribute
{
    protected override ValidationResult IsValid(object value, ValidationContext validationContext)
    {
        var validProviders = new[] { "facebook", "google" };
        if (value == null || !validProviders.Contains(value.ToString()))
        {
            return new ValidationResult("Invalid provider. Valid providers are 'facebook' and 'google'.");
        }
        return ValidationResult.Success;
    }
}